import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Especially important if using Fluid compute: Don't put this client in a
 * global variable. Always create a new client within each function when using
 * it.
 */
export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.error('[v0] Missing Supabase environment variables:', {
      hasUrl: !!url,
      hasKey: !!key,
    })
  }

  const cookieStore = await cookies()

  return createServerClient(url!, key!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Make all auth cookies session-only (no maxAge/expires)
            // so they are cleared when the browser is closed
            const sessionOptions = { ...options }
            delete sessionOptions.maxAge
            delete sessionOptions.expires
            cookieStore.set(name, value, sessionOptions)
          })
        } catch {
          // The "setAll" method was called from a Server Component.
          // This can be ignored if you have proxy refreshing
          // user sessions.
        }
      },
    },
  })
}
