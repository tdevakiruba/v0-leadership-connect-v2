'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function OAuthHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams.get('code')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function handleOAuthCode() {
      if (code && !isProcessing) {
        setIsProcessing(true)
        const supabase = createClient()
        
        // Set a timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
          setError('Sign in timed out. Please try again.')
          setIsProcessing(false)
        }, 10000)
        
        try {
          // First check if user is already authenticated
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session) {
            clearTimeout(timeoutId)
            window.history.replaceState({}, '', '/')
            router.push('/dashboard')
            router.refresh()
            return
          }
          
          // Exchange code for session
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          clearTimeout(timeoutId)
          
          if (!exchangeError) {
            window.history.replaceState({}, '', '/')
            router.push('/dashboard')
            router.refresh()
          } else {
            setError(exchangeError.message)
            window.history.replaceState({}, '', '/')
          }
        } catch (err) {
          clearTimeout(timeoutId)
          setError(err instanceof Error ? err.message : 'An unexpected error occurred')
          window.history.replaceState({}, '', '/')
        }
      }
    }

    handleOAuthCode()
  }, [code, router, isProcessing])

  // Show error state
  if (error) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
        <div className="text-center space-y-4 max-w-sm px-6">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <span className="text-destructive text-xl">!</span>
          </div>
          <p className="text-foreground font-medium">Sign in failed</p>
          <p className="text-muted-foreground text-sm">{error}</p>
          <button 
            onClick={() => router.push('/auth/login')}
            className="text-primary hover:underline text-sm"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  // Show loading state while processing OAuth
  if (code && isProcessing) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Completing sign in...</p>
        </div>
      </div>
    )
  }

  return null
}
