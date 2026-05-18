'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'

const TERMS_VERSION = '1.0'

export async function recordIPAgreementAcceptance(userId: string) {
  const supabase = await createClient()
  const headersList = await headers()
  
  // Get IP address from headers (works with Vercel and most proxies)
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 
             headersList.get('x-real-ip') || 
             'unknown'
  
  // Get user agent
  const userAgent = headersList.get('user-agent') || 'unknown'
  
  const { error } = await supabase
    .from('ip_agreement_acceptance')
    .insert({
      user_id: userId,
      ip_address: ip,
      accepted_at: new Date().toISOString(),
      terms_version: TERMS_VERSION,
      acceptance_status: true,
      user_agent: userAgent,
    })
  
  if (error) {
    console.error('Failed to record IP agreement acceptance:', error)
    throw new Error('Failed to record agreement acceptance')
  }
  
  return { success: true }
}

export async function signOutAction() {
  const supabase = await createClient()
  
  // Sign out from Supabase globally (terminates ALL sessions on ALL devices)
  await supabase.auth.signOut({ scope: 'global' })
  
  // Get the cookie store and clear all Supabase-related cookies
  const cookieStore = await cookies()
  
  // Clear the main Supabase auth cookies
  const allCookies = cookieStore.getAll()
  for (const cookie of allCookies) {
    if (cookie.name.includes('supabase') || cookie.name.includes('sb-')) {
      cookieStore.delete(cookie.name)
    }
  }
  
  // Redirect to login page
  redirect('/auth/login')
}
