'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function signOutAction() {
  const supabase = await createClient()
  
  // Sign out from Supabase (this invalidates the session on the server)
  await supabase.auth.signOut()
  
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
