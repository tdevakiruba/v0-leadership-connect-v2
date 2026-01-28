'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function OAuthHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams.get('code')

  useEffect(() => {
    async function handleOAuthCode() {
      if (code) {
        const supabase = createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        
        if (!error) {
          router.push('/dashboard')
          router.refresh()
        } else {
          console.error('[v0] OAuth code exchange error:', error.message)
          router.push('/auth/error?message=' + encodeURIComponent(error.message))
        }
      }
    }

    handleOAuthCode()
  }, [code, router])

  return null
}
