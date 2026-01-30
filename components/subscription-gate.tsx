import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { checkSubscription } from "@/lib/subscription"

interface SubscriptionGateProps {
  children: React.ReactNode
}

export async function SubscriptionGate({ children }: SubscriptionGateProps) {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect("/auth/login")
  }

  // Check subscription status
  const { hasActiveSubscription } = await checkSubscription(user.id)

  if (!hasActiveSubscription) {
    redirect("/pricing?expired=true")
  }

  return <>{children}</>
}
