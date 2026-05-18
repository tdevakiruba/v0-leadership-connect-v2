import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { recordIPAgreementAcceptance } from '@/app/actions/auth-actions'

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
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (!error && data.user) {
        // Check if this user has already recorded their IP agreement
        const { data: existingAgreement } = await supabase
          .from('ip_agreement_acceptance')
          .select('id')
          .eq('user_id', data.user.id)
          .limit(1)
          .single()
        
        // If no existing agreement, record one (new user signup)
        if (!existingAgreement) {
          try {
            await recordIPAgreementAcceptance(data.user.id)
          } catch (err) {
            console.error('Failed to record IP agreement:', err)
            // Don't block auth flow if recording fails, but log it
          }
        }
        
        return NextResponse.redirect(`${origin}${next}`)
      }
      
      if (error) {
        return NextResponse.redirect(`${origin}/auth/error?message=${encodeURIComponent(error.message)}`)
      }
      
      return NextResponse.redirect(`${origin}${next}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed'
      return NextResponse.redirect(`${origin}/auth/error?message=${encodeURIComponent(message)}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/error?message=No authentication code received`)
}
