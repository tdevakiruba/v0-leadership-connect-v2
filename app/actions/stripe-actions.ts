"use server"

import { stripe } from "@/lib/stripe"
import { PRODUCTS, calculateOrderTotal } from "@/lib/products"
import { headers } from "next/headers"
import { createClient } from "@/lib/supabase/server"

export async function createCheckoutSession(productId: string) {
  const headersList = await headers()
  const origin = headersList.get("origin") || "http://localhost:3000"
  
  // Get the current user
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "You must be logged in to purchase a subscription" }
  }

  // Find the product
  const product = PRODUCTS.find(p => p.id === productId)
  if (!product) {
    return { error: "Product not found" }
  }

  // Only purchasable products can go through checkout
  if (product.priceInCents === null || product.ctaType !== 'purchase') {
    return { error: "This product requires contacting sales" }
  }

  // Check if Stripe is properly configured
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("[v0] STRIPE_SECRET_KEY is not set")
    return { error: "Payment system is not configured. Please contact support." }
  }

  try {
    const { total } = calculateOrderTotal(product.priceInCents)
    console.log("[v0] Creating checkout session for product:", product.id, "user:", user.id, "total:", total)
    
    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      customer_email: user.email || undefined,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: product.name,
              description: product.description,
            },
            unit_amount: total,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: `${product.name} - ${product.duration} Days Access`,
          custom_fields: [
            {
              name: "Program",
              value: "Leadership Reboot SIGNAL",
            },
          ],
        },
      },
      return_url: `${origin}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        userId: user.id,
        userEmail: user.email || "",
        productId: product.id,
        durationDays: product.duration.toString(),
      },
    })

    console.log("[v0] Checkout session created successfully:", session.id)
    return { clientSecret: session.client_secret }
  } catch (error) {
    console.error("[v0] Error creating checkout session:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return { error: `Failed to create checkout session: ${errorMessage}` }
  }
}

export async function getCheckoutSession(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    return { session }
  } catch (error) {
    console.error("Error retrieving checkout session:", error)
    return { error: "Failed to retrieve checkout session" }
  }
}
