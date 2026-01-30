"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  CheckCircle2, 
  Lock, 
  Play,
  ArrowRight,
  Filter
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface Lesson {
  id: string
  day_number: number
  focus_area: string
  focus_reframe_technique: string | null
  leader_example: string | null
}

interface LessonProgress {
  day_number: number
  completed: boolean
}

interface LessonsListProps {
  lessons: Lesson[]
  progress: LessonProgress[]
}

const phases = [
  { letter: "S", name: "Self-Awareness", range: [1, 15], color: "bg-signal-s", light: "bg-signal-s-light", text: "text-signal-s" },
  { letter: "I", name: "Interpretation", range: [16, 30], color: "bg-signal-i", light: "bg-signal-i-light", text: "text-signal-i" },
  { letter: "G", name: "Goals & Strategy", range: [31, 45], color: "bg-signal-g", light: "bg-signal-g-light", text: "text-signal-g" },
  { letter: "N", name: "Navigation", range: [46, 60], color: "bg-signal-n", light: "bg-signal-n-light", text: "text-signal-n" },
  { letter: "A", name: "Action & Execution", range: [61, 75], color: "bg-signal-a", light: "bg-signal-a-light", text: "text-signal-a" },
  { letter: "L", name: "Leadership Identity", range: [76, 90], color: "bg-signal-l", light: "bg-signal-l-light", text: "text-signal-l" },
]

export function LessonsList({ lessons, progress }: LessonsListProps) {
  const [search, setSearch] = useState("")
  const [activePhase, setActivePhase] = useState<string | null>(null)

  const completedDays = new Set(progress.filter(p => p.completed).map(p => p.day_number))
  const currentDay = completedDays.size > 0 ? Math.min(Math.max(...completedDays) + 1, 90) : 1
  const currentPhase = phases.find(p => currentDay >= p.range[0] && currentDay <= p.range[1])

  const filteredLessons = useMemo(() => {
    return lessons.filter(lesson => {
      const matchesSearch = !search || 
        lesson.focus_reframe_technique?.toLowerCase().includes(search.toLowerCase()) ||
        lesson.leader_example?.toLowerCase().includes(search.toLowerCase()) ||
        lesson.day_number.toString().includes(search)
      
      const matchesPhase = !activePhase || 
        phases.find(p => p.letter === activePhase && lesson.day_number >= p.range[0] && lesson.day_number <= p.range[1])
      
      return matchesSearch && matchesPhase
    })
  }, [lessons, search, activePhase])

  const getPhaseForDay = (day: number) => phases.find(p => day >= p.range[0] && day <= p.range[1])
  const currentLesson = lessons.find(l => l.day_number === currentDay)

  return (
    <div className="space-y-5">
      {/* Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Leadership Frameworks</h1>
          <p className="text-sm text-muted-foreground">{completedDays.size}/90 completed</p>
        </div>
        
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search..." 
            className="pl-9 h-9 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Phase Tabs - Compact horizontal scroll */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        <button
          onClick={() => setActivePhase(null)}
          className={cn(
            "flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-full transition-colors",
            !activePhase ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"
          )}
        >
          All
        </button>
        {phases.map(phase => {
          const completed = Array.from({ length: 15 }, (_, i) => phase.range[0] + i).filter(d => completedDays.has(d)).length
          const isActive = activePhase === phase.letter
          return (
            <button
              key={phase.letter}
              onClick={() => setActivePhase(isActive ? null : phase.letter)}
              className={cn(
                "flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-colors",
                isActive ? cn(phase.color, "text-white") : "text-muted-foreground hover:bg-muted"
              )}
            >
              <span className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                isActive ? "bg-white/20" : cn(phase.light, phase.text)
              )}>
                {phase.letter}
              </span>
              <span className="hidden md:inline">{phase.name}</span>
              <span className="text-[10px] opacity-70">{completed}/15</span>
            </button>
          )
        })}
      </div>

      {/* Continue Card - Compact */}
      {currentLesson && !search && !activePhase && (
        <Card className="border-signal-s/20 bg-gradient-to-r from-signal-s/5 to-transparent">
          <CardContent className="py-3 px-4 flex items-center gap-3">
            <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0", currentPhase?.color, "text-white")}>
              <Play className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Continue</p>
              <p className="font-medium text-sm truncate">Day {currentDay}: {currentLesson.focus_reframe_technique}</p>
            </div>
            <Link href={`/dashboard/lessons/${currentDay}`}>
              <Button size="sm" className="btn-executive h-8 px-4">
                Start <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Grid of Framework Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
        {filteredLessons.map(lesson => {
          const phase = getPhaseForDay(lesson.day_number)
          const isCompleted = completedDays.has(lesson.day_number)
          const isCurrent = lesson.day_number === currentDay
          const isLocked = lesson.day_number > currentDay

          return (
            <Link
              key={lesson.id}
              href={isLocked ? "#" : `/dashboard/lessons/${lesson.day_number}`}
              onClick={(e) => isLocked && e.preventDefault()}
              className={cn(
                "group relative p-3 rounded-xl border transition-all",
                isCompleted && "bg-muted/40 border-transparent",
                isCurrent && "bg-signal-s/5 border-signal-s/30 shadow-sm",
                !isCompleted && !isCurrent && !isLocked && "hover:bg-muted/50 hover:border-muted-foreground/20 border-transparent",
                isLocked && "opacity-40 cursor-not-allowed border-transparent"
              )}
            >
              {/* Top row: Day + Phase badge */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "h-7 w-7 rounded-md flex items-center justify-center text-xs font-bold",
                    isCompleted && cn(phase?.color, "text-white"),
                    isCurrent && cn(phase?.light, phase?.text),
                    !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                  )}>
                    {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : isLocked ? <Lock className="h-3.5 w-3.5" /> : lesson.day_number}
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium">DAY {lesson.day_number}</span>
                  {isCurrent && (
                    <Badge variant="secondary" className="h-4 text-[9px] px-1.5 bg-signal-s text-white border-0">
                      NOW
                    </Badge>
                  )}
                </div>
                <div className={cn("h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold", phase?.light, phase?.text)}>
                  {phase?.letter}
                </div>
              </div>

              {/* Framework title */}
              <h3 className={cn(
                "font-medium text-sm leading-snug line-clamp-2 min-h-[2.5rem]",
                isLocked && "text-muted-foreground",
                !isLocked && "group-hover:text-signal-s transition-colors"
              )}>
                {lesson.focus_reframe_technique || `Framework ${lesson.day_number}`}
              </h3>

              {/* Author */}
              {lesson.leader_example && (
                <p className="text-[11px] text-muted-foreground mt-1.5 truncate">{lesson.leader_example}</p>
              )}

              {/* Hover indicator */}
              {!isLocked && (
                <ArrowRight className="absolute bottom-3 right-3 h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </Link>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredLessons.length === 0 && (
        <div className="text-center py-10">
          <Filter className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No frameworks found</p>
          <Button variant="ghost" size="sm" className="mt-2 text-xs" onClick={() => { setSearch(""); setActivePhase(null) }}>
            Clear filters
          </Button>
        </div>
      )}
    </div>
  )
}
