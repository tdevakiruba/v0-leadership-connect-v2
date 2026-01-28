"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Quote,
  Lightbulb,
  Target,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Lock,
  BookOpen
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"

interface Lesson {
  id: string
  day_number: number
  focus_area: string
  focus_reframe_technique: string | null
  leader_example: string | null
  leader_context: string | null
  leader_story_id: string | null
  thought_to_work_on: string | null
  action_for_today: string | null
}

interface Progress {
  id: string
  completed: boolean
  reflection_text: string | null
  ai_action: string | null
  completed_at: string | null
}

interface AdjacentLesson {
  day_number: number
  focus_reframe_technique: string | null
}

interface LessonDetailProps {
  userId: string
  lesson: Lesson
  progress: Progress | null | undefined
  currentDay: number
  prevLesson: AdjacentLesson | null
  nextLesson: AdjacentLesson | null
}

const focusAreaColors: Record<string, string> = {
  "Awareness": "bg-signal-awareness text-white",
  "Interpretation": "bg-signal-interpretation text-white",
  "Alignment": "bg-signal-alignment text-foreground",
  "Execution": "bg-signal-execution text-white",
  "Leadership Identity": "bg-signal-identity text-white",
}

const phaseInfo: Record<string, { letter: string; name: string }> = {
  "Awareness": { letter: "S", name: "Self-Awareness" },
  "Interpretation": { letter: "I", name: "Interpretation" },
  "Alignment": { letter: "G", name: "Goals & Strategy" },
  "Execution": { letter: "A", name: "Action & Execution" },
  "Leadership Identity": { letter: "L", name: "Leadership Identity" },
}

export function LessonDetail({
  userId,
  lesson,
  progress,
  currentDay,
  prevLesson,
  nextLesson,
}: LessonDetailProps) {
  const [reflection, setReflection] = useState(progress?.reflection_text || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(progress?.completed || false)
  const router = useRouter()
  const supabase = createClient()

  const isLocked = lesson.day_number > currentDay
  const phase = phaseInfo[lesson.focus_area] || { letter: "?", name: lesson.focus_area }

  const handleComplete = async () => {
    if (!reflection.trim()) {
      toast.error("Please write a reflection before completing this lesson")
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from("user_progress")
        .upsert({
          user_id: userId,
          day_number: lesson.day_number,
          completed: true,
          completed_at: new Date().toISOString(),
          reflection_text: reflection,
          points_awarded: 10,
        }, {
          onConflict: "user_id,day_number"
        })

      if (error) throw error

      setIsCompleted(true)
      toast.success("Lesson completed! +10 points earned")
      router.refresh()
    } catch (error) {
      console.error("[v0] Error completing lesson:", error)
      toast.error("Failed to save progress")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLocked) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardContent className="py-16 text-center">
            <Lock className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-2">Day {lesson.day_number} is Locked</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Complete your previous days to unlock this lesson. You're currently on Day {currentDay}.
            </p>
            <Link href="/dashboard">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        {prevLesson ? (
          <Link href={`/dashboard/lessons/${prevLesson.day_number}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Day {prevLesson.day_number}
            </Button>
          </Link>
        ) : (
          <div />
        )}
        <Link href="/dashboard/lessons">
          <Button variant="outline" size="sm">
            <BookOpen className="mr-2 h-4 w-4" />
            All Lessons
          </Button>
        </Link>
        {nextLesson && lesson.day_number < currentDay ? (
          <Link href={`/dashboard/lessons/${nextLesson.day_number}`}>
            <Button variant="ghost" size="sm">
              Day {nextLesson.day_number}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <div />
        )}
      </div>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-2xl font-bold text-primary flex-shrink-0">
          {phase.letter}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge className={cn(
              "text-xs font-medium",
              focusAreaColors[lesson.focus_area] || "bg-primary text-primary-foreground"
            )}>
              {lesson.focus_area}
            </Badge>
            <span className="text-sm text-muted-foreground">Day {lesson.day_number} of 90</span>
            {isCompleted && (
              <Badge variant="secondary" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Completed
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold mt-2 text-balance">
            {lesson.focus_reframe_technique || `Day ${lesson.day_number} Focus`}
          </h1>
          <p className="text-muted-foreground mt-1">
            {phase.name} Phase
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Leader Example */}
          {lesson.leader_example && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Quote className="h-5 w-5 text-accent" />
                  Leadership Insight
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg bg-accent/5 p-4 border-l-4 border-accent">
                  <p className="font-medium text-foreground">
                    {lesson.leader_example}
                  </p>
                  {lesson.leader_context && (
                    <p className="text-sm text-muted-foreground mt-3">
                      {lesson.leader_context}
                    </p>
                  )}
                  {lesson.leader_story_id && (
                    <p className="text-xs text-muted-foreground mt-2 uppercase tracking-wider">
                      {lesson.leader_story_id}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Thought to Work On */}
          {lesson.thought_to_work_on && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  Thought to Work On
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {lesson.thought_to_work_on}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Action for Today */}
          {lesson.action_for_today && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Target className="h-5 w-5 text-accent" />
                  Today's Action
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {lesson.action_for_today}
                </p>
              </CardContent>
            </Card>
          )}

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
                placeholder="What resonated with you today? How will you apply this insight? What challenges do you anticipate?"
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                rows={5}
                disabled={isCompleted}
                className="resize-none"
              />
              {!isCompleted ? (
                <Button 
                  onClick={handleComplete} 
                  disabled={isSubmitting || !reflection.trim()}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting ? "Saving..." : "Complete Lesson"} 
                  <CheckCircle2 className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <div className="flex items-center gap-2 text-green-600 p-3 bg-green-50 rounded-lg">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Lesson Completed on {new Date(progress?.completed_at || "").toLocaleDateString()}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Progress Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Day Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full",
                    lesson.leader_example ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"
                  )}>
                    {lesson.leader_example ? <CheckCircle2 className="h-4 w-4" /> : "1"}
                  </div>
                  <span className="text-sm">Read leadership insight</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full",
                    lesson.thought_to_work_on ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"
                  )}>
                    {lesson.thought_to_work_on ? <CheckCircle2 className="h-4 w-4" /> : "2"}
                  </div>
                  <span className="text-sm">Reflect on the thought</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full",
                    lesson.action_for_today ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"
                  )}>
                    {lesson.action_for_today ? <CheckCircle2 className="h-4 w-4" /> : "3"}
                  </div>
                  <span className="text-sm">Plan your action</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full",
                    isCompleted ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"
                  )}>
                    {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : "4"}
                  </div>
                  <span className="text-sm">Write reflection</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Reflection Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Be specific about situations</li>
                <li>• Connect insights to real challenges</li>
                <li>• Note emotional responses</li>
                <li>• Identify actionable next steps</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
