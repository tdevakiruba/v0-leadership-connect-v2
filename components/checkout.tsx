"use client"

import { useCallback, useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js"
import { createCheckoutSession } from "@/app/actions/stripe-actions"

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

interface CheckoutProps {
  productId: string
}

export function Checkout({ productId }: CheckoutProps) {
  const [error, setError] = useState<string | null>(null)

  const fetchClientSecret = useCallback(async () => {
    const result = await createCheckoutSession(productId)
    if (result.error) {
      setError(result.error)
      throw new Error(result.error)
    }
    return result.clientSecret!
  }, [productId])

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-4">
          <svg className="h-6 w-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <p className="text-destructive font-medium mb-2">Payment Setup Issue</p>
        <p className="text-sm text-muted-foreground">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 text-sm text-signal-s hover:underline"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div id="checkout" className="w-full">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ fetchClientSecret }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
