"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { User } from "@supabase/supabase-js"
import { Flame, Zap, Target, CheckCircle2, Sparkles } from "lucide-react"

interface TodayDashboardProps {
  user: User
  profile: {
    id: string
    full_name: string | null
    title: string | null
    company: string | null
  } | null
  currentDay: number
  todayLesson: {
    id: string
    day_number: number
    focus_area: string
    focus_reframe_technique: string | null
    leader_example: string | null
    leader_context: string | null
    thought_to_work_on: string | null
    action_for_today: string | null
  } | null
  todayProgress: {
    id: string
    completed: boolean
    reflection_text: string | null
    ai_action: string | null
  } | null
  completedDays: number
  streak: number
  totalPoints: number
}

export function TodayDashboard({
  user,
  profile,
  currentDay,
  todayLesson,
  todayProgress,
  completedDays,
  streak,
  totalPoints,
}: TodayDashboardProps) {
  const [reflection, setReflection] = useState(todayProgress?.reflection_text || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(todayProgress?.completed || false)
  const router = useRouter()
  const supabase = createClient()

  const progressPercentage = Math.round((completedDays / 90) * 100)
  const firstName = profile?.full_name?.split(" ")[0] || user.email?.split("@")[0] || "Leader"

  const handleComplete = async () => {
    if (!reflection.trim()) {
      toast.error("Please write a reflection first")
      return
    }

    setIsSubmitting(true)
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        toast.error("Session expired. Please log in again.")
        router.push("/auth/login")
        return
      }

      const userId = session.user.id

      const { data: existingProfile, error: profileCheckError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .maybeSingle()

      if (profileCheckError) {
        throw new Error(`Profile check failed: ${profileCheckError.message}`)
      }

      if (!existingProfile) {
        const { error: createProfileError } = await supabase
          .from("profiles")
          .insert({
            id: userId,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0],
          })
        
        if (createProfileError && !createProfileError.message.includes("duplicate")) {
          throw new Error(`Failed to create profile: ${createProfileError.message}`)
        }
      }

      const { data: existingProgress, error: checkError } = await supabase
        .from("user_progress")
        .select("id")
        .eq("user_id", userId)
        .eq("day_number", currentDay)
        .maybeSingle()

      if (checkError) {
        throw new Error(`Progress check failed: ${checkError.message}`)
      }

      if (existingProgress) {
        const { error } = await supabase
          .from("user_progress")
          .update({
            completed: true,
            completed_at: new Date().toISOString(),
            reflection_text: reflection,
            points_awarded: 10,
            streak_count: streak + 1,
          })
          .eq("id", existingProgress.id)
        
        if (error) throw new Error(`Update failed: ${error.message}`)
      } else {
        const { error } = await supabase
          .from("user_progress")
          .insert({
            user_id: userId,
            day_number: currentDay,
            completed: true,
            completed_at: new Date().toISOString(),
            reflection_text: reflection,
            points_awarded: 10,
            streak_count: streak + 1,
          })
        
        if (error) throw new Error(`Insert failed: ${error.message}`)
      }

      setIsCompleted(true)
      toast.success("Day completed! +10 points")
      router.refresh()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      toast.error(`Failed to save: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentPhase = getSIGNALPhase(currentDay)

  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero Header with gradient */}
      <header className="relative mb-10 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 p-8 text-white overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
              Day {currentDay} of 90
            </span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
              {currentPhase?.name}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4 text-balance">
            {todayLesson?.focus_reframe_technique || `Welcome back, ${firstName}`}
          </h1>
          
          {/* Progress bar */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
              <div 
                className="h-full bg-white transition-all duration-500 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span className="text-sm font-medium tabular-nums">{progressPercentage}%</span>
          </div>
          
          {/* Stats pills */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">
              <Flame className="h-4 w-4 text-orange-300" />
              <span className="font-medium">{streak}</span>
              <span className="text-white/70 text-sm">day streak</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span className="font-medium">{totalPoints}</span>
              <span className="text-white/70 text-sm">points</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              <span className="font-medium">{completedDays}</span>
              <span className="text-white/70 text-sm">completed</span>
            </div>
          </div>
        </div>
      </header>

      {todayLesson ? (
        <div className="space-y-8">
          {/* Focus area badge */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
              {todayLesson.focus_area}
            </span>
          </div>

          {/* Leader insight card */}
          {todayLesson.leader_example && (
            <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-xl p-6 border border-blue-100">
              <div className="flex gap-4">
                <div className="w-1 bg-blue-500 rounded-full flex-shrink-0" />
                <div>
                  <p className="text-lg leading-relaxed text-slate-700">
                    {todayLesson.leader_example}
                  </p>
                  {todayLesson.leader_context && (
                    <p className="mt-3 text-sm text-slate-500 font-medium">
                      {todayLesson.leader_context}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Mindset & Action cards */}
          <div className="grid md:grid-cols-2 gap-4">
            {todayLesson.thought_to_work_on && (
              <div className="bg-white rounded-xl p-6 border border-slate-200 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/50 transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Zap className="h-4 w-4 text-amber-600" />
                  </div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Mindset
                  </h3>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  {todayLesson.thought_to_work_on}
                </p>
              </div>
            )}
            {todayLesson.action_for_today && (
              <div className="bg-white rounded-xl p-6 border border-slate-200 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/50 transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Target className="h-4 w-4 text-emerald-600" />
                  </div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Action
                  </h3>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  {todayLesson.action_for_today}
                </p>
              </div>
            )}
          </div>

          {/* Reflection card */}
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-4">
              Your Reflection
            </h3>
            <textarea
              placeholder="What insight will you carry forward today?"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              disabled={isCompleted}
              rows={4}
              className={cn(
                "w-full bg-slate-50 text-slate-700 placeholder:text-slate-400",
                "border border-slate-200 rounded-lg p-4",
                "resize-none outline-none text-base leading-relaxed",
                "focus:border-blue-300 focus:ring-2 focus:ring-blue-100",
                "transition-all duration-200"
              )}
            />
            
            <div className="mt-4 flex items-center justify-between">
              {!isCompleted ? (
                <Button 
                  onClick={handleComplete} 
                  disabled={isSubmitting || !reflection.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 py-2 h-auto font-medium shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all"
                >
                  {isSubmitting ? "Saving..." : "Complete Day"}
                </Button>
              ) : (
                <div className="flex items-center gap-2 text-emerald-600 font-medium">
                  <CheckCircle2 className="h-5 w-5" />
                  Day completed
                </div>
              )}
              <span className="text-sm text-slate-400">+10 points on completion</span>
            </div>
          </div>

          {/* SIGNAL Progress */}
          <div className="bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-xl p-6 border border-slate-100">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-4">
              Your SIGNAL Journey
            </h3>
            <div className="flex gap-2">
              {["S", "I", "G", "N", "A", "L"].map((letter, i) => {
                const dayRange = [1, 16, 31, 46, 61, 76][i]
                const isActive = currentDay >= dayRange && currentDay < (dayRange + 15) || (i === 5 && currentDay >= 76)
                const isDone = currentDay > dayRange + 14
                const labels = ["Self", "Interpret", "Goals", "Navigate", "Action", "Lead"]
                return (
                  <div key={letter} className="flex-1 text-center">
                    <div 
                      className={cn(
                        "w-full aspect-square rounded-xl flex items-center justify-center text-lg font-bold mb-2 transition-all",
                        isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-200" :
                        isDone ? "bg-emerald-500 text-white" :
                        "bg-slate-100 text-slate-400"
                      )}
                    >
                      {letter}
                    </div>
                    <span className={cn(
                      "text-xs font-medium",
                      isActive ? "text-blue-600" :
                      isDone ? "text-emerald-600" :
                      "text-slate-400"
                    )}>
                      {labels[i]}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse text-slate-400">Loading your lesson...</div>
        </div>
      )}
    </div>
  )
}

function getSIGNALPhase(currentDay: number) {
  const phases = [
    { name: "Self-Awareness", range: [1, 15] },
    { name: "Interpretation", range: [16, 30] },
    { name: "Goals & Strategy", range: [31, 45] },
    { name: "Navigation", range: [46, 60] },
    { name: "Action & Execution", range: [61, 75] },
    { name: "Leadership Identity", range: [76, 90] },
  ]
  return phases.find(p => currentDay >= p.range[0] && currentDay <= p.range[1]) || phases[0]
}
