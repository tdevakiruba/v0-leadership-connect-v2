import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CertificatesView } from "@/components/dashboard/certificates-view"

export default async function CertificatesPage() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // Get user progress
  const { data: progress } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", user.id)

  return (
    <CertificatesView
      user={user}
      profile={profile}
      progress={progress || []}
    />
  )
}
