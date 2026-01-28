"use client"

import React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const navigation = [
  { name: "Today", href: "/dashboard" },
  { name: "Lessons", href: "/dashboard/lessons" },
  { name: "Journey", href: "/dashboard/journey" },
  { name: "Lab", href: "/dashboard/lab" },
  { name: "Certificates", href: "/dashboard/certificates" },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("[v0] Sign out error:", error.message)
      }
      // Force navigation even if there's an error
      window.location.href = "/auth/login"
    } catch (err) {
      console.error("[v0] Sign out exception:", err)
      window.location.href = "/auth/login"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/dashboard" className="text-sm font-semibold tracking-tight">
              Leadership Reboot
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navigation.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== "/dashboard" && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "text-sm transition-colors",
                      isActive 
                        ? "text-foreground" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard/settings"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden md:block"
              >
                Settings
              </Link>
              <button 
                onClick={handleSignOut}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden md:block"
              >
                Sign out
              </button>
              
              {/* Mobile menu button */}
              <button 
                className="md:hidden p-2 -m-2"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <div className="w-5 h-4 flex flex-col justify-between">
                  <span className={cn(
                    "block h-px bg-foreground transition-transform origin-center",
                    menuOpen && "translate-y-1.5 rotate-45"
                  )} />
                  <span className={cn(
                    "block h-px bg-foreground transition-opacity",
                    menuOpen && "opacity-0"
                  )} />
                  <span className={cn(
                    "block h-px bg-foreground transition-transform origin-center",
                    menuOpen && "-translate-y-1.5 -rotate-45"
                  )} />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-border/50 bg-background">
            <div className="max-w-6xl mx-auto px-6 py-4 space-y-3">
              {navigation.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== "/dashboard" && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "block text-sm py-1",
                      isActive ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {item.name}
                  </Link>
                )
              })}
              <div className="pt-3 border-t border-border/50 space-y-3">
                <Link 
                  href="/dashboard/settings"
                  onClick={() => setMenuOpen(false)}
                  className="block text-sm text-muted-foreground py-1"
                >
                  Settings
                </Link>
                <button 
                  onClick={() => { handleSignOut(); setMenuOpen(false); }}
                  className="block text-sm text-muted-foreground py-1"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Page content */}
      <main className="max-w-6xl mx-auto px-6 lg:px-8 py-12">
        {children}
      </main>
    </div>
  )
}
