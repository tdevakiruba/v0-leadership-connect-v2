"use client"

import React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { signOutAction } from "@/app/actions/auth-actions"
import { 
  LayoutDashboard, 
  BookOpen, 
  Route, 
  FlaskConical, 
  Award,
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react"
import { HeaderSearch } from "@/components/dashboard/header-search"
import { HeaderNotifications } from "@/components/dashboard/header-notifications"
import { HeaderProfile } from "@/components/dashboard/header-profile"

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Frameworks", href: "/dashboard/lessons", icon: BookOpen },
  { name: "Leadership Pathway", href: "/dashboard/journey", icon: Route },
  { name: "Decision Lab", href: "/dashboard/lab", icon: FlaskConical },
  { name: "Certificates", href: "/dashboard/certificates", icon: Award },
]

export function DashboardShell({
  children,
}: {
  children: React.ReactNode
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userId, setUserId] = useState<string>("")
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
      }
    }
    getUser()
  }, [supabase])

  const handleSignOut = async () => {
    try {
      // Clear client-side auth state first
      await supabase.auth.signOut()
      
      // Clear all cookies via server action and redirect
      await signOutAction()
    } catch (err) {
      // Fallback: force redirect even if there's an error
      window.location.href = "/auth/login"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-card border-r border-border pt-5 pb-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-6 mb-8">
            <Link href="/" className="flex items-center gap-3">
              <Image 
                src="/images/reboot-logo.png" 
                alt="Leadership Reboot" 
                width={40} 
                height={40}
                className="rounded-xl"
              />
              <span className="font-bold text-[#0f2a4a] text-lg leading-tight">
                Leadership Reboot SIGNAL™
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1">
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Menu
            </p>
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== "/dashboard" && pathname.startsWith(item.href))
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all",
                    isActive 
                      ? "bg-primary/10 text-primary shadow-sm" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Bottom section */}
          <div className="px-4 space-y-1 border-t border-border pt-4 mt-4">
            <Link 
              href="/dashboard/settings"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all",
                pathname === "/dashboard/settings"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Settings className="h-5 w-5" />
              Settings
            </Link>
            <button 
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              <LogOut className="h-5 w-5" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 lg:hidden",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full pt-5 pb-4 overflow-y-auto">
          {/* Logo & Close */}
          <div className="flex items-center justify-between px-6 mb-8">
            <Link href="/" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
              <Image 
                src="/reboot-logo.png" 
                alt="Leadership Reboot" 
                width={40} 
                height={40}
                className="rounded-xl"
              />
              <span className="font-semibold text-foreground">Leadership Reboot</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="p-2 -m-2 text-muted-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1">
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Menu
            </p>
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== "/dashboard" && pathname.startsWith(item.href))
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Bottom section */}
          <div className="px-4 space-y-1 border-t border-border pt-4 mt-4">
            <Link 
              href="/dashboard/settings"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl"
            >
              <Settings className="h-5 w-5" />
              Settings
            </Link>
            <button 
              onClick={() => { handleSignOut(); setSidebarOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl"
            >
              <LogOut className="h-5 w-5" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="lg:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* Mobile menu button */}
            <button 
              className="lg:hidden p-2 -m-2 text-muted-foreground hover:text-foreground"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Page title - Desktop */}
            <div className="hidden lg:block">
              <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
            </div>

            {/* Search bar */}
            <HeaderSearch />

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              <HeaderNotifications userId={userId} />
              <HeaderProfile userId={userId} />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
