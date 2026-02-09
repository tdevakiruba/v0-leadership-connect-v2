"use client"

import { useEffect } from "react"

/**
 * BrowserCloseGuard
 *
 * Provides an additional layer of session cleanup when the browser is closed.
 * The primary mechanism is session-only cookies (no maxAge/expires) which the
 * browser automatically deletes when all windows close. This component adds
 * a best-effort cleanup via the `beforeunload` event to also clear any
 * client-side Supabase auth state (localStorage tokens).
 */
export function BrowserCloseGuard() {
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Clear any Supabase auth tokens from localStorage as a fallback.
      // Session-only cookies handle the server-side, but Supabase JS
      // also caches tokens in localStorage.
      try {
        const storageKeys = Object.keys(localStorage)
        for (const key of storageKeys) {
          if (
            key.includes("supabase") ||
            key.includes("sb-") ||
            key.includes("auth-token")
          ) {
            localStorage.removeItem(key)
          }
        }
      } catch {
        // localStorage may not be available
      }

      // Use sendBeacon to attempt server-side sign-out.
      // This is fire-and-forget and may not always succeed,
      // but session cookies being cleared by the browser is the
      // primary mechanism.
      try {
        navigator.sendBeacon("/api/auth/sign-out")
      } catch {
        // Best-effort only
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [])

  return null
}
