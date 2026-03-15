import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { LessonDetail } from "@/components/dashboard/lesson-detail"

export default async function LessonPage({ 
  params 
}: { 
  params: Promise<{ day: string }> 
}) {
  const { day } = await params
  const dayNumber = parseInt(day)
  
  if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 90) {
    notFound()
  }

  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect("/auth/login")
  }

  // Check if user has access to this day
  const { data: progress } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", user.id)

  const completedDays = progress?.filter(p => p.completed).map(p => p.day_number) || []
  const currentDay = completedDays.length > 0 
    ? Math.min(Math.max(...completedDays) + 1, 90)
    : 1

  // Get the lesson from V2_daily_lessons
  const { data: lesson } = await supabase
    .from("V2_daily_lessons")
    .select("*")
    .eq("day_number", dayNumber)
    .single()

  if (!lesson) {
    notFound()
  }

  // Get this day's progress if exists
  const dayProgress = progress?.find(p => p.day_number === dayNumber)

  // Get adjacent lessons for navigation from V2_daily_lessons
  const { data: prevLesson } = await supabase
    .from("V2_daily_lessons")
    .select("day_number, focus_reframe_technique")
    .eq("day_number", dayNumber - 1)
    .single()

  const { data: nextLesson } = await supabase
    .from("V2_daily_lessons")
    .select("day_number, focus_reframe_technique")
    .eq("day_number", dayNumber + 1)
    .single()

  return (
    <LessonDetail
      userId={user.id}
      lesson={lesson}
      progress={dayProgress}
      currentDay={currentDay}
      prevLesson={prevLesson}
      nextLesson={nextLesson}
    />
  )
}
