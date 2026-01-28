"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Flame, 
  Trophy, 
  Calendar, 
  Target,
  Lightbulb,
  Quote,
  CheckCircle2,
  ArrowRight,
  Sparkles
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

const focusAreaColors: Record<string, string> = {
  "Awareness": "bg-signal-awareness text-white",
  "Interpretation": "bg-signal-interpretation text-white",
  "Alignment": "bg-signal-alignment text-foreground",
  "Execution": "bg-signal-execution text-white",
  "Leadership Identity": "bg-signal-identity text-white",
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
      // Ensure profile exists before saving progress (handles edge case where trigger didn't run)
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || null,
        }, {
          onConflict: "id"
        })

      if (profileError) {
        console.error("[v0] Error ensuring profile exists:", profileError)
      }

      const { error } = await supabase
        .from("user_progress")
        .upsert({
          user_id: user.id,
          day_number: currentDay,
          completed: true,
          completed_at: new Date().toISOString(),
          reflection_text: reflection,
          points_awarded: 10,
          streak_count: streak + 1,
        }, {
          onConflict: "user_id,day_number"
        })

      if (error) throw error

      setIsCompleted(true)
      toast.success("Day completed! +10 points earned")
      router.refresh()
    } catch (error) {
      console.error("[v0] Error completing day:", error)
      toast.error("Failed to save progress")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-balance">
            Good {getTimeOfDay()}, {firstName}
          </h1>
          <p className="text-muted-foreground mt-1">
            Day {currentDay} of your leadership transformation
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="gap-1.5 py-1.5 px-3">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="font-semibold">{streak}</span> day streak
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Day</p>
                <p className="text-2xl font-bold">{currentDay}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                <CheckCircle2 className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedDays} <span className="text-sm font-normal text-muted-foreground">/ 90</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10">
                <Flame className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Streak</p>
                <p className="text-2xl font-bold">{streak} <span className="text-sm font-normal text-muted-foreground">days</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10">
                <Trophy className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Points</p>
                <p className="text-2xl font-bold">{totalPoints}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-medium">{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {90 - completedDays} days remaining in your transformation
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Today's Lesson */}
      {todayLesson ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <Badge className={cn(
                    "text-xs font-medium",
                    focusAreaColors[todayLesson.focus_area] || "bg-primary text-primary-foreground"
                  )}>
                    {todayLesson.focus_area}
                  </Badge>
                  <span className="text-sm text-muted-foreground">Day {todayLesson.day_number}</span>
                </div>
                <CardTitle className="text-xl">
                  {todayLesson.focus_reframe_technique || "Today's Focus"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Leader Example */}
                {todayLesson.leader_example && (
                  <div className="rounded-lg bg-muted/50 p-4 border-l-4 border-accent">
                    <div className="flex items-start gap-3">
                      <Quote className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {todayLesson.leader_example}
                        </p>
                        {todayLesson.leader_context && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {todayLesson.leader_context}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Thought to Work On */}
                {todayLesson.thought_to_work_on && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      <h3 className="font-semibold">Thought to Work On</h3>
                    </div>
                    <p className="text-muted-foreground pl-7">
                      {todayLesson.thought_to_work_on}
                    </p>
                  </div>
                )}

                {/* Action for Today */}
                {todayLesson.action_for_today && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-accent" />
                      <h3 className="font-semibold">Today's Action</h3>
                    </div>
                    <p className="text-muted-foreground pl-7">
                      {todayLesson.action_for_today}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reflection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent" />
                  Your Reflection
                </CardTitle>
                <CardDescription>
                  Take a moment to reflect on today's lesson and how it applies to your leadership journey.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="What resonated with you today? How will you apply this insight?"
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  rows={4}
                  disabled={isCompleted}
                  className="resize-none"
                />
                {!isCompleted ? (
                  <Button 
                    onClick={handleComplete} 
                    disabled={isSubmitting || !reflection.trim()}
                    className="w-full sm:w-auto"
                  >
                    {isSubmitting ? "Saving..." : "Complete Day"} 
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Day Completed!</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* SIGNAL Phase */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Current Phase</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getSIGNALPhase(currentDay).map((phase, index) => (
                    <div 
                      key={phase.letter}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-lg transition-colors",
                        phase.active ? "bg-muted" : ""
                      )}
                    >
                      <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                        phase.active 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted text-muted-foreground"
                      )}>
                        {phase.letter}
                      </div>
                      <div>
                        <p className={cn(
                          "text-sm font-medium",
                          phase.active ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {phase.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Days {phase.days}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Leadership Tip</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Great leaders don't just complete tasks - they reflect on their growth. 
                  Your daily reflection builds the self-awareness muscle that separates 
                  good managers from transformational leaders.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Loading today's lesson...</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function getTimeOfDay() {
  const hour = new Date().getHours()
  if (hour < 12) return "morning"
  if (hour < 17) return "afternoon"
  return "evening"
}

function getSIGNALPhase(currentDay: number) {
  return [
    { letter: "S", name: "Self-Awareness", days: "1-15", active: currentDay >= 1 && currentDay <= 15 },
    { letter: "I", name: "Interpretation", days: "16-30", active: currentDay >= 16 && currentDay <= 30 },
    { letter: "G", name: "Goals & Strategy", days: "31-45", active: currentDay >= 31 && currentDay <= 45 },
    { letter: "N", name: "Navigation", days: "46-60", active: currentDay >= 46 && currentDay <= 60 },
    { letter: "A", name: "Action & Execution", days: "61-75", active: currentDay >= 61 && currentDay <= 75 },
    { letter: "L", name: "Leadership Identity", days: "76-90", active: currentDay >= 76 && currentDay <= 90 },
  ]
}
