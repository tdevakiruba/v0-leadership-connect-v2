"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { User } from "@supabase/supabase-js"

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
    <div className="max-w-4xl">
      {/* Header */}
      <header className="mb-12">
        <p className="text-muted-foreground mb-1">Day {currentDay} of 90</p>
        <h1 className="text-4xl font-light tracking-tight mb-6 text-balance">
          {todayLesson?.focus_reframe_technique || `Welcome back, ${firstName}`}
        </h1>
        
        {/* Progress bar */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-foreground/80 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="text-sm text-muted-foreground tabular-nums">{progressPercentage}%</span>
        </div>
        
        {/* Minimal stats */}
        <div className="flex gap-6 mt-4 text-sm">
          <span className="text-muted-foreground">{streak} day streak</span>
          <span className="text-muted-foreground">{totalPoints} pts</span>
          <span className="text-muted-foreground">{currentPhase?.name}</span>
        </div>
      </header>

      {todayLesson ? (
        <div className="space-y-12">
          {/* Focus area label */}
          <div>
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {todayLesson.focus_area}
            </span>
          </div>

          {/* Leader insight */}
          {todayLesson.leader_example && (
            <blockquote className="border-l-2 border-foreground/20 pl-6">
              <p className="text-lg leading-relaxed text-foreground/90">
                {todayLesson.leader_example}
              </p>
              {todayLesson.leader_context && (
                <cite className="block mt-3 text-sm text-muted-foreground not-italic">
                  {todayLesson.leader_context}
                </cite>
              )}
            </blockquote>
          )}

          {/* Mindset & Action */}
          <div className="grid sm:grid-cols-2 gap-8">
            {todayLesson.thought_to_work_on && (
              <div>
                <h3 className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">
                  Mindset
                </h3>
                <p className="text-foreground/80 leading-relaxed">
                  {todayLesson.thought_to_work_on}
                </p>
              </div>
            )}
            {todayLesson.action_for_today && (
              <div>
                <h3 className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">
                  Action
                </h3>
                <p className="text-foreground/80 leading-relaxed">
                  {todayLesson.action_for_today}
                </p>
              </div>
            )}
          </div>

          {/* Reflection */}
          <div className="pt-8 border-t border-border/50">
            <h3 className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">
              Your Reflection
            </h3>
            <textarea
              placeholder="What insight will you carry forward today?"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              disabled={isCompleted}
              rows={4}
              className={cn(
                "w-full bg-transparent text-foreground placeholder:text-muted-foreground/50",
                "border-0 border-b border-border/50 focus:border-foreground/30",
                "resize-none outline-none py-3 text-base leading-relaxed",
                "transition-colors duration-200"
              )}
            />
            
            <div className="mt-6">
              {!isCompleted ? (
                <Button 
                  onClick={handleComplete} 
                  disabled={isSubmitting || !reflection.trim()}
                  variant="outline"
                  className="rounded-full px-6"
                >
                  {isSubmitting ? "Saving..." : "Complete Day"}
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">Day completed</p>
              )}
            </div>
          </div>

          {/* SIGNAL Progress */}
          <div className="pt-8">
            <div className="flex gap-1">
              {["S", "I", "G", "N", "A", "L"].map((letter, i) => {
                const dayRange = [1, 16, 31, 46, 61, 76][i]
                const isActive = currentDay >= dayRange && currentDay < (dayRange + 15) || (i === 5 && currentDay >= 76)
                const isDone = currentDay > dayRange + 14
                return (
                  <div 
                    key={letter}
                    className={cn(
                      "flex-1 py-2 text-center text-xs font-medium transition-colors",
                      isActive ? "text-foreground" :
                      isDone ? "text-foreground/60" :
                      "text-muted-foreground/40"
                    )}
                  >
                    {letter}
                  </div>
                )
              })}
            </div>
            <div className="flex gap-1 mt-1">
              {[1, 16, 31, 46, 61, 76].map((start, i) => {
                const end = i === 5 ? 90 : start + 14
                const segmentProgress = currentDay >= end ? 100 : 
                  currentDay >= start ? ((currentDay - start + 1) / (end - start + 1)) * 100 : 0
                return (
                  <div key={start} className="flex-1 h-0.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-foreground/60 transition-all duration-300"
                      style={{ width: `${segmentProgress}%` }}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground">Loading...</p>
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
