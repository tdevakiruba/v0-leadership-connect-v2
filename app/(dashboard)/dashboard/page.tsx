import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TodayDashboard } from "@/components/dashboard/today-dashboard"

export default async function DashboardPage() {
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

  // Get user progress to determine current day
  const { data: progress } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", user.id)
    .order("day_number", { ascending: false })

  // Calculate current day (next incomplete day or day 1)
  const completedDays = progress?.filter(p => p.completed).map(p => p.day_number) || []
  const currentDay = completedDays.length > 0 
    ? Math.min(Math.max(...completedDays) + 1, 90)
    : 1

  // Get today's lesson with quote
  const { data: todayLesson } = await supabase
    .from("V2_Daily_lessons")
    .select("*, quote")
    .eq("day_number", currentDay)
    .single()

  // Get today's progress if exists
  const todayProgress = progress?.find(p => p.day_number === currentDay)

  // Calculate streak
  let streak = 0
  if (completedDays.length > 0) {
    const sortedDays = [...completedDays].sort((a, b) => b - a)
    for (let i = 0; i < sortedDays.length; i++) {
      if (i === 0 || sortedDays[i] === sortedDays[i-1] - 1) {
        streak++
      } else {
        break
      }
    }
  }

  // Calculate total points
  const totalPoints = progress?.reduce((sum, p) => sum + (p.points_awarded || 0), 0) || 0

  // Fetch next office hours
  const { data: nextOfficeHours } = await supabase
    .from("office_hours")
    .select("*")
    .eq("status", "upcoming")
    .gte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(1)
    .single()

  return (
    <TodayDashboard
      user={user}
      profile={profile}
      currentDay={currentDay}
      todayLesson={todayLesson}
      todayProgress={todayProgress}
      completedDays={completedDays.length}
      streak={streak}
      totalPoints={totalPoints}
      nextOfficeHours={nextOfficeHours}
    />
  )
}
