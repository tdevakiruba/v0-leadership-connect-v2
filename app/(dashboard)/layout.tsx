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
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">LR</span>
              </div>
              <span className="font-semibold text-slate-800 hidden sm:block">Leadership Reboot</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-100 rounded-full p-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== "/dashboard" && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-full transition-all",
                      isActive 
                        ? "bg-white text-blue-600 shadow-sm" 
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <Link 
                href="/dashboard/settings"
                className="text-sm text-slate-500 hover:text-slate-700 transition-colors hidden md:block"
              >
                Settings
              </Link>
              <button 
                onClick={handleSignOut}
                className="text-sm text-slate-500 hover:text-slate-700 transition-colors hidden md:block"
              >
                Sign out
              </button>
              
              {/* Mobile menu button */}
              <button 
                className="md:hidden p-2 -m-2 text-slate-600"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <div className="w-5 h-4 flex flex-col justify-between">
                  <span className={cn(
                    "block h-0.5 bg-current transition-transform origin-center rounded-full",
                    menuOpen && "translate-y-[7px] rotate-45"
                  )} />
                  <span className={cn(
                    "block h-0.5 bg-current transition-opacity rounded-full",
                    menuOpen && "opacity-0"
                  )} />
                  <span className={cn(
                    "block h-0.5 bg-current transition-transform origin-center rounded-full",
                    menuOpen && "-translate-y-[7px] -rotate-45"
                  )} />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white">
            <div className="max-w-6xl mx-auto px-6 py-4 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== "/dashboard" && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "block px-4 py-2 rounded-lg text-sm font-medium",
                      isActive ? "bg-blue-50 text-blue-600" : "text-slate-600"
                    )}
                  >
                    {item.name}
                  </Link>
                )
              })}
              <div className="pt-3 mt-3 border-t border-slate-100 space-y-1">
                <Link 
                  href="/dashboard/settings"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2 rounded-lg text-sm text-slate-600"
                >
                  Settings
                </Link>
                <button 
                  onClick={() => { handleSignOut(); setMenuOpen(false); }}
                  className="block w-full text-left px-4 py-2 rounded-lg text-sm text-slate-600"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Page content */}
      <main className="max-w-6xl mx-auto px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
