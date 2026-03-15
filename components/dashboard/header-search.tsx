"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Search, BookOpen, Route, FlaskConical, Award, X, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

interface SearchResult {
  id: string
  type: "lesson" | "page"
  title: string
  description?: string
  href: string
  day?: number
}

const staticPages: SearchResult[] = [
  { id: "overview", type: "page", title: "Dashboard Overview", href: "/dashboard" },
  { id: "frameworks", type: "page", title: "Frameworks", description: "Browse all 90 leadership modules", href: "/dashboard/lessons" },
  { id: "pathway", type: "page", title: "Leadership Pathway", description: "Track your 90-day journey", href: "/dashboard/journey" },
  { id: "lab", type: "page", title: "Decision Lab", description: "Submit scenarios for office hours", href: "/dashboard/lab" },
  { id: "certificates", type: "page", title: "Certificates", description: "View your achievements", href: "/dashboard/certificates" },
  { id: "settings", type: "page", title: "Settings", description: "Manage your account", href: "/dashboard/settings" },
]

export function HeaderSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Keyboard shortcut (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setIsOpen(true)
        inputRef.current?.focus()
      }
      if (e.key === "Escape") {
        setIsOpen(false)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Search effect
  useEffect(() => {
    const searchDebounce = setTimeout(async () => {
      if (!query.trim()) {
        setResults(staticPages.slice(0, 4))
        return
      }

      setIsLoading(true)
      const lowerQuery = query.toLowerCase()

      // Filter static pages
      const pageResults = staticPages.filter(
        p => p.title.toLowerCase().includes(lowerQuery) || 
             p.description?.toLowerCase().includes(lowerQuery)
      )

      // Search lessons from V2_daily_lessons
      const { data: lessons } = await supabase
        .from("V2_daily_lessons")
        .select("id, day_number, focus_area, focus_reframe_technique, phase_name")
        .or(`focus_area.ilike.%${query}%,focus_reframe_technique.ilike.%${query}%,phase_name.ilike.%${query}%`)
        .limit(5)

      const lessonResults: SearchResult[] = (lessons || []).map(lesson => ({
        id: lesson.id,
        type: "lesson",
        title: `Day ${lesson.day_number}: ${lesson.focus_area}`,
        description: lesson.focus_reframe_technique || undefined,
        href: `/dashboard/lessons/${lesson.day_number}`,
        day: lesson.day_number
      }))

      setResults([...pageResults, ...lessonResults].slice(0, 8))
      setIsLoading(false)
    }, 200)

    return () => clearTimeout(searchDebounce)
  }, [query, supabase])

  const handleSelect = (result: SearchResult) => {
    router.push(result.href)
    setIsOpen(false)
    setQuery("")
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "lesson": return BookOpen
      default: return ArrowRight
    }
  }

  return (
    <div ref={containerRef} className="relative flex-1 max-w-md mx-4 hidden sm:block">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input 
          ref={inputRef}
          type="text"
          placeholder="Search frameworks, pages... (⌘K)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="w-full h-10 pl-10 pr-4 bg-muted border-0 rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        {query && (
          <button 
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((result) => {
                const Icon = getIcon(result.type)
                return (
                  <button
                    key={result.id}
                    onClick={() => handleSelect(result)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-muted transition-colors"
                  >
                    <div className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg",
                      result.type === "lesson" ? "bg-signal-s-light text-signal-s" : "bg-muted text-muted-foreground"
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{result.title}</p>
                      {result.description && (
                        <p className="text-xs text-muted-foreground truncate">{result.description}</p>
                      )}
                    </div>
                    {result.type === "lesson" && (
                      <span className="text-xs text-muted-foreground">Day {result.day}</span>
                    )}
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No results found for &quot;{query}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  )
}
