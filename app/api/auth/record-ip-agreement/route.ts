import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

const TERMS_VERSION = '1.0'

export async function POST() {
  const supabase = await createClient()
  const headersList = await headers()
  
  // Get the current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Check if user already has an agreement
  const { data: existingAgreement } = await supabase
    .from('ip_agreement_acceptance')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)
    .single()
  
  if (existingAgreement) {
    // Already has agreement, return success
    return NextResponse.json({ success: true, message: 'Agreement already recorded' })
  }
  
  // Get IP address from headers
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 
             headersList.get('x-real-ip') || 
             'unknown'
  
  // Get user agent
  const userAgent = headersList.get('user-agent') || 'unknown'
  
  // Record the agreement
  const { error } = await supabase
    .from('ip_agreement_acceptance')
    .insert({
      user_id: user.id,
      ip_address: ip,
      accepted_at: new Date().toISOString(),
      terms_version: TERMS_VERSION,
      acceptance_status: true,
      user_agent: userAgent,
    })
  
  if (error) {
    console.error('Failed to record IP agreement:', error)
    return NextResponse.json({ error: 'Failed to record agreement' }, { status: 500 })
  }
  
  return NextResponse.json({ success: true })
}
