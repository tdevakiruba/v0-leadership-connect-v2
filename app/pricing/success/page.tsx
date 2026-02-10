import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import { getCheckoutSession } from "@/app/actions/stripe-actions"
import { sendWelcomeEmail } from "@/lib/email"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ArrowRight, Calendar } from "lucide-react"
import Image from "next/image"

interface SuccessPageProps {
  searchParams: Promise<{ session_id?: string }>
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const sessionId = params.session_id
  if (!sessionId) {
    redirect("/pricing")
  }

  // Verify the session
  const { session, error } = await getCheckoutSession(sessionId)
  
  if (error || !session || session.payment_status !== "paid") {
    redirect("/pricing")
  }

  // Check if subscription was created for THIS session (by webhook)
  const { data: existingSub } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("stripe_session_id", sessionId)
    .single()

  let subscription = existingSub

  console.log("[v0] Success page - sessionId:", sessionId, "existingSub:", existingSub ? `found (end_date: ${existingSub.end_date})` : "not found")

  // If webhook hasn't processed yet for this session, create subscription manually using admin client to bypass RLS
  if (!subscription) {
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 90)

    const { error: insertError } = await supabaseAdmin.from("subscriptions").insert({
      user_id: user.id,
      stripe_session_id: sessionId,
      stripe_payment_intent_id: session.payment_intent as string,
      stripe_customer_id: session.customer as string,
      status: "active",
      plan_type: "leadership-90",
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      amount_paid: session.amount_total || 0,
      currency: session.currency || "usd",
    })

    if (insertError) {
      console.error("[v0] Failed to create subscription on success page:", insertError)
    } else {
      // Send welcome email since webhook didn't process this session
      const userName = session.customer_details?.name || user.email?.split("@")[0] || "there"
      if (user.email) {
        await sendWelcomeEmail({
          to: user.email,
          name: userName,
          endDate,
          amountPaid: session.amount_total || 0,
        })
      }

      // Re-fetch the subscription after inserting
      const { data: newSub } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("stripe_session_id", sessionId)
        .single()
      if (newSub) {
        subscription = newSub
      }
    }
  }

  const endDate = subscription?.end_date 
    ? new Date(subscription.end_date)
    : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-signal-s-light/20 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="mb-8">
          <div className="h-20 w-20 rounded-full bg-signal-g-light mx-auto flex items-center justify-center mb-4">
            <CheckCircle2 className="h-10 w-10 text-signal-g" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome Aboard!</h1>
          <p className="text-muted-foreground">
            Your 90-Day Leadership Transformation begins now.
          </p>
        </div>

        {/* Subscription Details */}
        <div className="bg-white rounded-2xl border p-6 mb-8 text-left">
          <div className="flex items-center gap-3 mb-4">
            <Image 
              src="/images/reboot-logo.png" 
              alt="Leadership Reboot" 
              width={40} 
              height={40}
              className="rounded-full"
            />
            <div>
              <p className="font-semibold">Leadership Reboot SIGNAL™</p>
              <p className="text-sm text-muted-foreground">90-Day Program</p>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Access expires:</span>
              <span className="font-medium">
                {endDate.toLocaleDateString("en-US", { 
                  month: "long", 
                  day: "numeric", 
                  year: "numeric" 
                })}
              </span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <Link href="/dashboard">
          <Button className="w-full btn-executive text-white h-12 text-base">
            Start Day 1
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>

        <p className="text-xs text-muted-foreground mt-4">
          A confirmation email has been sent to {user.email}
        </p>
      </div>
    </div>
  )
}
