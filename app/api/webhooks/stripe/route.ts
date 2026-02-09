import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createClient } from "@supabase/supabase-js"
import Stripe from "stripe"

// Use service role for webhook to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error("Webhook signature verification failed:", error)
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    )
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session

      if (session.payment_status === "paid") {
        const userId = session.metadata?.userId
        const durationDays = parseInt(session.metadata?.durationDays || "90")
        const productId = session.metadata?.productId || "leadership-90"

        if (userId) {
          const startDate = new Date()
          const endDate = new Date()
          endDate.setDate(endDate.getDate() + durationDays)

          // Check if subscription already exists for this session
          const { data: existingSubscription } = await supabaseAdmin
            .from("subscriptions")
            .select("id")
            .eq("stripe_session_id", session.id)
            .single()

          if (!existingSubscription) {
            // Create the subscription
            const { error: insertError } = await supabaseAdmin
              .from("subscriptions")
              .insert({
                user_id: userId,
                stripe_session_id: session.id,
                stripe_payment_intent_id: session.payment_intent as string,
                stripe_customer_id: session.customer as string,
                status: "active",
                plan_type: productId,
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString(),
                amount_paid: session.amount_total || 0,
                currency: session.currency || "usd",
              })

            if (insertError) {
              console.error("Error creating subscription:", insertError)
              return NextResponse.json(
                { error: "Failed to create subscription" },
                { status: 500 }
              )
            }

            console.log(`Subscription created for user ${userId}, expires ${endDate.toISOString()}`)
          }
        }
      }
      break
    }

    case "checkout.session.expired": {
      // Handle expired checkout session if needed
      console.log("Checkout session expired:", event.data.object.id)
      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
