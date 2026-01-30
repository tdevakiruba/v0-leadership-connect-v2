"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { User, Settings, LogOut, Award, TrendingUp, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { signOutAction } from "@/app/actions/auth-actions"

interface Profile {
  id: string
  full_name: string | null
  title: string | null
  avatar_url: string | null
  role: string
}

export function HeaderProfile({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState({ points: 0, streak: 0 })
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

  // Fetch profile and stats
  useEffect(() => {
    const fetchData = async () => {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, full_name, title, avatar_url, role")
        .eq("id", userId)
        .single()

      if (profileData) {
        setProfile(profileData)
      }

      // Get user stats
      const { data: progressData } = await supabase
        .from("user_progress")
        .select("points_earned")
        .eq("user_id", userId)

      if (progressData) {
        const totalPoints = progressData.reduce((sum, p) => sum + (p.points_earned || 0), 0)
        setStats(prev => ({ ...prev, points: totalPoints }))
      }
    }

    fetchData()
  }, [userId, supabase])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      await signOutAction()
    } catch {
      window.location.href = "/auth/login"
    }
  }

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "U"

  return (
    <div ref={containerRef} className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 pr-2 hover:bg-muted rounded-xl transition-colors"
      >
        {profile?.avatar_url ? (
          <img 
            src={profile.avatar_url} 
            alt={profile.full_name || "User"} 
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium text-sm">
            {initials}
          </div>
        )}
        <ChevronDown className={cn(
          "h-4 w-4 text-muted-foreground transition-transform hidden sm:block",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
          {/* Profile Header */}
          <div className="p-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-3">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.full_name || "User"} 
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-lg">
                  {initials}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">
                  {profile?.full_name || "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {profile?.title || "Executive Leader"}
                </p>
                {profile?.role && profile.role !== "individual" && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-signal-s-light text-signal-s text-xs font-medium rounded-full capitalize">
                    {profile.role.replace("_", " ")}
                  </span>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-signal-s" />
                <span className="text-sm font-medium">{stats.points}</span>
                <span className="text-xs text-muted-foreground">Index</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="h-4 w-4 text-signal-n" />
                <span className="text-sm font-medium">{stats.streak}</span>
                <span className="text-xs text-muted-foreground">Streak</span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              href="/dashboard/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
            >
              <User className="h-4 w-4 text-muted-foreground" />
              My Profile
            </Link>
            <Link
              href="/dashboard/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
              Settings
            </Link>
            <Link
              href="/dashboard/certificates"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
            >
              <Award className="h-4 w-4 text-muted-foreground" />
              Certificates
            </Link>
          </div>

          {/* Sign Out */}
          <div className="py-2 border-t border-border">
            <button 
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
