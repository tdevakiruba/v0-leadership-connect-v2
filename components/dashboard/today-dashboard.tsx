"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { 
  Flame, 
  CheckCircle2,
  ArrowRight,
  Target,
  Zap,
  TrendingUp
} from "lucide-react"
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

const focusAreaStyles: Record<string, { bg: string; text: string; border: string }> = {
  "Awareness": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  "Interpretation": { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" },
  "Alignment": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  "Execution": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  "Leadership Identity": { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
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
      toast.error("Please write a reflection before completing today's lesson")
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

      // First ensure profile exists
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .maybeSingle()

      if (profileCheckError) {
        throw new Error(`Profile check failed: ${profileCheckError.message}`)
      }

      // If no profile exists, create one
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

      // Check if progress already exists
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
      toast.success("Day completed! +10 points earned")
      router.refresh()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      toast.error(`Failed to save: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const focusStyle = focusAreaStyles[todayLesson?.focus_area || ""] || { bg: "bg-muted", text: "text-foreground", border: "border-border" }
  const currentPhase = getSIGNALPhase(currentDay)

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col">
      {/* Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-muted-foreground text-sm">Welcome back,</p>
          <h1 className="text-3xl font-semibold tracking-tight">{firstName}</h1>
        </div>
        
        {/* Mini Stats Row */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
              <Flame className="h-4 w-4 text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Streak</p>
              <p className="font-semibold text-sm">{streak}d</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Points</p>
              <p className="font-semibold text-sm">{totalPoints}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-4xl font-bold">{currentDay}</span>
            <div>
              <p className="text-sm font-medium">Day of 90</p>
              <p className="text-xs text-muted-foreground">{currentPhase?.name}</p>
            </div>
          </div>
          <span className="text-sm font-medium">{progressPercentage}%</span>
        </div>
        <Progress value={progressPercentage} className="h-1.5" />
      </div>

      {/* Main Content */}
      {todayLesson ? (
        <div className="flex-1 grid lg:grid-cols-5 gap-8">
          {/* Left Column - Today's Focus */}
          <div className="lg:col-span-3 flex flex-col">
            <div className={cn(
              "rounded-2xl border p-6 flex-1 flex flex-col",
              focusStyle.bg, focusStyle.border
            )}>
              {/* Focus Area Tag */}
              <div className="flex items-center gap-2 mb-6">
                <span className={cn(
                  "text-xs font-medium px-2.5 py-1 rounded-full",
                  focusStyle.bg, focusStyle.text, "border", focusStyle.border
                )}>
                  {todayLesson.focus_area}
                </span>
              </div>

              {/* Technique */}
              <h2 className={cn("text-2xl font-semibold mb-4", focusStyle.text)}>
                {todayLesson.focus_reframe_technique || "Today's Focus"}
              </h2>

              {/* Leader Example */}
              {todayLesson.leader_example && (
                <div className="mb-6">
                  <p className="text-foreground/80 leading-relaxed">
                    {todayLesson.leader_example}
                  </p>
                  {todayLesson.leader_context && (
                    <p className="text-muted-foreground text-sm mt-2 italic">
                      {todayLesson.leader_context}
                    </p>
                  )}
                </div>
              )}

              {/* Thought & Action */}
              <div className="mt-auto space-y-4">
                {todayLesson.thought_to_work_on && (
                  <div className="flex gap-3">
                    <Zap className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Mindset Shift</p>
                      <p className="text-sm text-foreground/80">{todayLesson.thought_to_work_on}</p>
                    </div>
                  </div>
                )}
                {todayLesson.action_for_today && (
                  <div className="flex gap-3">
                    <Target className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Today's Action</p>
                      <p className="text-sm text-foreground/80">{todayLesson.action_for_today}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Reflection */}
          <div className="lg:col-span-2 flex flex-col">
            <div className="rounded-2xl border border-border bg-card p-6 flex-1 flex flex-col">
              <h3 className="font-semibold mb-2">Your Reflection</h3>
              <p className="text-sm text-muted-foreground mb-4">
                What insight will you carry forward?
              </p>
              
              <Textarea
                placeholder="Write your reflection here..."
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                disabled={isCompleted}
                className="flex-1 min-h-[120px] resize-none border-0 bg-muted/50 focus-visible:ring-1 mb-4"
              />

              {!isCompleted ? (
                <Button 
                  onClick={handleComplete} 
                  disabled={isSubmitting || !reflection.trim()}
                  className="w-full"
                  size="lg"
                >
                  {isSubmitting ? "Saving..." : "Complete Day"} 
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <div className="flex items-center justify-center gap-2 py-3 rounded-lg bg-emerald-50 text-emerald-700">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Day Completed</span>
                </div>
              )}
            </div>

            {/* SIGNAL Progress Mini */}
            <div className="mt-6">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">SIGNAL Journey</p>
              <div className="flex gap-1">
                {["S", "I", "G", "N", "A", "L"].map((letter, i) => {
                  const dayRange = [1, 16, 31, 46, 61, 76][i]
                  const isActive = currentDay >= dayRange && currentDay < (dayRange + 15) || (i === 5 && currentDay >= 76)
                  const isCompleted = currentDay > dayRange + 14
                  return (
                    <div 
                      key={letter}
                      className={cn(
                        "flex-1 h-8 rounded flex items-center justify-center text-xs font-semibold transition-colors",
                        isActive ? "bg-primary text-primary-foreground" :
                        isCompleted ? "bg-emerald-100 text-emerald-700" :
                        "bg-muted text-muted-foreground"
                      )}
                    >
                      {letter}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading today's lesson...</p>
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
