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
      <div className="p-6 text-center">
        <p className="text-destructive">{error}</p>
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
