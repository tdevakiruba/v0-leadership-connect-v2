'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function OAuthHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams.get('code')
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    async function handleOAuthCode() {
      if (code && !isProcessing) {
        setIsProcessing(true)
        const supabase = createClient()
        
        // First check if user is already authenticated
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          // Already authenticated, redirect to dashboard
          window.history.replaceState({}, '', '/')
          router.push('/dashboard')
          router.refresh()
          return
        }
        
        // Exchange code for session
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        
        if (!error) {
          // Clear the URL and redirect
          window.history.replaceState({}, '', '/')
          router.push('/dashboard')
          router.refresh()
        } else {
          console.error('[v0] OAuth code exchange error:', error.message)
          window.history.replaceState({}, '', '/')
          router.push('/auth/error?message=' + encodeURIComponent(error.message))
        }
      }
    }

    handleOAuthCode()
  }, [code, router, isProcessing])

  // Show loading state while processing OAuth
  if (code && isProcessing) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Completing sign in...</p>
        </div>
      </div>
    )
  }

  return null
}
