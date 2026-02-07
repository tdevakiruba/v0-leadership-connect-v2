"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { signOutAction } from "@/app/actions/auth-actions"
import { LogOut, Clock } from "lucide-react"

const INACTIVITY_LIMIT = 20 * 60 * 1000 // 20 minutes
const WARNING_BEFORE = 2 * 60 * 1000    // Show warning 2 minutes before timeout
const WARNING_AT = INACTIVITY_LIMIT - WARNING_BEFORE // 18 minutes

const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
  "click",
  "pointerdown",
] as const

export function InactivityGuard() {
  const [showWarning, setShowWarning] = useState(false)
  const [countdown, setCountdown] = useState(120) // seconds remaining
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastActivityRef = useRef(Date.now())
  const router = useRouter()
  const supabase = createClient()

  const performLogout = useCallback(async () => {
    // Clear all timers
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current)
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current)
    if (countdownRef.current) clearInterval(countdownRef.current)

    try {
      // Sign out globally (all sessions on all devices)
      await supabase.auth.signOut({ scope: "global" })
      await signOutAction()
    } catch {
      window.location.href = "/auth/login"
    }
  }, [supabase])

  const resetTimers = useCallback(() => {
    lastActivityRef.current = Date.now()

    // If warning is showing, dismiss it
    if (showWarning) {
      setShowWarning(false)
    }

    // Clear existing timers
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current)
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current)
    if (countdownRef.current) clearInterval(countdownRef.current)

    // Set warning timer (fires at 18 minutes)
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true)
      setCountdown(120)

      // Start countdown
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (countdownRef.current) clearInterval(countdownRef.current)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }, WARNING_AT)

    // Set logout timer (fires at 20 minutes)
    logoutTimerRef.current = setTimeout(() => {
      performLogout()
    }, INACTIVITY_LIMIT)
  }, [performLogout, showWarning])

  // Set up activity listeners
  useEffect(() => {
    // Throttle activity handler to avoid excessive timer resets
    let throttleTimeout: ReturnType<typeof setTimeout> | null = null

    const handleActivity = () => {
      if (throttleTimeout) return
      throttleTimeout = setTimeout(() => {
        throttleTimeout = null
      }, 1000) // Throttle to once per second

      resetTimers()
    }

    // Register all activity events
    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, handleActivity, { passive: true })
    }

    // Also listen for visibility change (tab becomes active again)
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        // Check if we should have timed out while tab was hidden
        const elapsed = Date.now() - lastActivityRef.current
        if (elapsed >= INACTIVITY_LIMIT) {
          performLogout()
        } else if (elapsed >= WARNING_AT) {
          const remaining = Math.ceil((INACTIVITY_LIMIT - elapsed) / 1000)
          setShowWarning(true)
          setCountdown(remaining)

          // Clear old timers and set new ones for remaining time
          if (warningTimerRef.current) clearTimeout(warningTimerRef.current)
          if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current)
          if (countdownRef.current) clearInterval(countdownRef.current)

          countdownRef.current = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                if (countdownRef.current) clearInterval(countdownRef.current)
                return 0
              }
              return prev - 1
            })
          }, 1000)

          logoutTimerRef.current = setTimeout(() => {
            performLogout()
          }, INACTIVITY_LIMIT - elapsed)
        } else {
          resetTimers()
        }
      }
    }
    document.addEventListener("visibilitychange", handleVisibility)

    // Initial timer setup
    resetTimers()

    return () => {
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, handleActivity)
      }
      document.removeEventListener("visibilitychange", handleVisibility)
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current)
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
      if (throttleTimeout) clearTimeout(throttleTimeout)
    }
  }, [resetTimers, performLogout])

  const handleStayLoggedIn = () => {
    setShowWarning(false)
    resetTimers()
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  if (!showWarning) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-sm rounded-2xl bg-card border border-border shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-amber-50 dark:bg-amber-950/30 px-6 py-4 border-b border-amber-200 dark:border-amber-800/30">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Session Expiring</h3>
              <p className="text-xs text-muted-foreground">Inactivity detected</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your session will expire in{" "}
            <span className="font-bold text-amber-600 dark:text-amber-400 tabular-nums">
              {formatTime(countdown)}
            </span>{" "}
            due to inactivity. Would you like to stay logged in?
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-5">
          <button
            onClick={performLogout}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
          <button
            onClick={handleStayLoggedIn}
            className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Stay logged in
          </button>
        </div>
      </div>
    </div>
  )
}
