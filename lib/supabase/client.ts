import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.error('[v0] Missing Supabase environment variables:', {
      hasUrl: !!url,
      hasKey: !!key,
    })
  }

  return createBrowserClient(url!, key!, {
    cookieOptions: {
      // Session-only cookies: no maxAge means the browser
      // deletes them when all browser windows are closed
      maxAge: undefined,
    },
  })
}
