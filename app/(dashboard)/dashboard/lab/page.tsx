import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { LeadershipLab } from "@/components/dashboard/leadership-lab"
import { DecisionLabSubmit } from "@/components/dashboard/decision-lab-submit"

export default async function LabPage() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect("/auth/login")
  }

  // Get user profile with role
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // Check if user has elevated role (super_admin or cohort_leader)
  const isElevatedUser = profile?.role === "super_admin" || profile?.role === "cohort_leader"

  // For regular users, show the Decision Lab submission page
  if (!isElevatedUser) {
    return (
      <DecisionLabSubmit
        user={user}
        profile={profile}
      />
    )
  }

  // For elevated users (super_admin, cohort_leader), show the full Leadership Lab

  // Get user's teams
  const { data: teamMemberships } = await supabase
    .from("team_members")
    .select(`
      *,
      team:teams(*)
    `)
    .eq("user_id", user.id)

  // Get team members for each team
  const teams = await Promise.all(
    (teamMemberships || []).map(async (membership) => {
      const { data: members } = await supabase
        .from("team_members")
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq("team_id", membership.team_id)

      // Get progress for team members
      const memberIds = members?.map(m => m.user_id) || []
      const { data: memberProgress } = await supabase
        .from("user_progress")
        .select("*")
        .in("user_id", memberIds)

      return {
        ...membership.team,
        role: membership.role,
        members: members?.map(m => ({
          ...m.profile,
          teamRole: m.role,
          progress: memberProgress?.filter(p => p.user_id === m.user_id) || []
        })) || []
      }
    })
  )

  // Get user's own progress for comparison
  const { data: userProgress } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", user.id)

  return (
    <LeadershipLab
      user={user}
      profile={profile}
      teams={teams}
      userProgress={userProgress || []}
    />
  )
}
