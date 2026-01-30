import { createClient } from "@/lib/supabase/server"

export interface SubscriptionStatus {
  hasActiveSubscription: boolean
  subscription: {
    id: string
    start_date: string
    end_date: string
    status: string
    plan_type: string
  } | null
  daysRemaining: number
}

export async function checkSubscription(userId: string): Promise<SubscriptionStatus> {
  const supabase = await createClient()
  const today = new Date().toISOString().split("T")[0]

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .gte("end_date", today)
    .order("end_date", { ascending: false })
    .limit(1)
    .single()

  if (!subscription) {
    return {
      hasActiveSubscription: false,
      subscription: null,
      daysRemaining: 0
    }
  }

  const endDate = new Date(subscription.end_date)
  const todayDate = new Date()
  const daysRemaining = Math.ceil((endDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24))

  return {
    hasActiveSubscription: true,
    subscription: {
      id: subscription.id,
      start_date: subscription.start_date,
      end_date: subscription.end_date,
      status: subscription.status,
      plan_type: subscription.plan_type
    },
    daysRemaining
  }
}
