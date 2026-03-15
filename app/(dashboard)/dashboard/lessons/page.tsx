import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { LessonsList } from "@/components/dashboard/lessons-list"

export default async function LessonsPage() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect("/auth/login")
  }

  // Get all lessons from V2_daily_lessons
  const { data: lessons } = await supabase
    .from("V2_daily_lessons")
    .select("*")
    .order("day_number", { ascending: true })

  // Get user progress
  const { data: progress } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", user.id)

  return (
    <LessonsList 
      lessons={lessons || []} 
      progress={progress || []}
    />
  )
}
