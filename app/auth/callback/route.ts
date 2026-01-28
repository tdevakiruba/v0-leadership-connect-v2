import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const errorParam = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const next = searchParams.get('next') ?? '/dashboard'

  // Handle OAuth errors from provider
  if (errorParam) {
    const message = errorDescription || errorParam
    return NextResponse.redirect(`${origin}/auth/error?message=${encodeURIComponent(message)}`)
  }

  if (code) {
    try {
      const supabase = await createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`)
      }
      
      return NextResponse.redirect(`${origin}/auth/error?message=${encodeURIComponent(error.message)}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed'
      return NextResponse.redirect(`${origin}/auth/error?message=${encodeURIComponent(message)}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/error?message=No authentication code received`)
}
