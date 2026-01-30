"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Quote,
  Lightbulb,
  Target,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Lock,
  BookOpen,
  Square,
  CheckSquare,
  Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"
import { generateBoldActions, toggleActionCompleted, saveActionsToProgress } from "@/app/actions/ai-actions"

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
  actions_completed?: number[]
  ai_actions?: ActionItem[]
}

interface ActionItem {
  id: number
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'bold'
  isFromDB?: boolean
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

// SIGNAL™ phase color configurations - Monochromatic Blue-Teal Gradient Palette
const signalPhaseColors = [
  { letter: "S", name: "Self-Awareness", dayStart: 1, dayEnd: 15, bg: "bg-signal-s", text: "text-white", bgLight: "bg-signal-s-light", textLight: "text-signal-s", border: "border-signal-s/30" },
  { letter: "I", name: "Interpretation", dayStart: 16, dayEnd: 30, bg: "bg-signal-i", text: "text-white", bgLight: "bg-signal-i-light", textLight: "text-signal-i", border: "border-signal-i/30" },
  { letter: "G", name: "Goals & Strategy", dayStart: 31, dayEnd: 45, bg: "bg-signal-g", text: "text-white", bgLight: "bg-signal-g-light", textLight: "text-signal-g", border: "border-signal-g/30" },
  { letter: "N", name: "Navigation", dayStart: 46, dayEnd: 60, bg: "bg-signal-n", text: "text-white", bgLight: "bg-signal-n-light", textLight: "text-signal-n", border: "border-signal-n/30" },
  { letter: "A", name: "Action & Execution", dayStart: 61, dayEnd: 75, bg: "bg-signal-a", text: "text-white", bgLight: "bg-signal-a-light", textLight: "text-signal-a", border: "border-signal-a/30" },
  { letter: "L", name: "Leadership Identity", dayStart: 76, dayEnd: 90, bg: "bg-signal-l", text: "text-white", bgLight: "bg-signal-l-light", textLight: "text-signal-l", border: "border-signal-l/30" },
]

const getPhaseForDay = (day: number) => {
  return signalPhaseColors.find(p => day >= p.dayStart && day <= p.dayEnd) || signalPhaseColors[0]
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy': return 'bg-signal-s-light text-signal-s'
    case 'medium': return 'bg-signal-g-light text-signal-g'
    case 'bold': return 'bg-signal-l-light text-signal-l'
    default: return 'bg-slate-100 text-slate-700'
  }
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
  const [actions, setActions] = useState<ActionItem[]>([])
  const [completedActions, setCompletedActions] = useState<number[]>(progress?.actions_completed || [])
  const [isLoadingActions, setIsLoadingActions] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const isLocked = lesson.day_number > currentDay
  const phase = getPhaseForDay(lesson.day_number)

  // Load or generate actions on mount
  useEffect(() => {
    async function loadActions() {
      if (!lesson) return

      // If we have cached AI actions, use them
      if (progress?.ai_actions && progress.ai_actions.length > 0) {
        const allActions: ActionItem[] = []
        if (lesson.action_for_today) {
          allActions.push({
            id: 0,
            title: "Today's Core Action",
            description: lesson.action_for_today,
            difficulty: 'medium',
            isFromDB: true
          })
        }
        allActions.push(...progress.ai_actions)
        setActions(allActions)
        return
      }

      // Generate new actions
      setIsLoadingActions(true)
      try {
        const result = await generateBoldActions(
          lesson.day_number,
          lesson.focus_area,
          lesson.focus_reframe_technique || lesson.focus_area,
          lesson.action_for_today || ""
        )

        const allActions: ActionItem[] = []
        
        if (lesson.action_for_today) {
          allActions.push({
            id: 0,
            title: "Today's Core Action",
            description: lesson.action_for_today,
            difficulty: 'medium',
            isFromDB: true
          })
        }

        const aiActions = result.actions.map((action, index) => ({
          ...action,
          id: index + 1
        }))
        allActions.push(...aiActions)
        
        setActions(allActions)

        // Save AI actions to database for caching
        await saveActionsToProgress(lesson.day_number, aiActions)
      } catch (error) {
        console.error('[v0] Error loading actions:', error)
        if (lesson.action_for_today) {
          setActions([{
            id: 0,
            title: "Today's Core Action",
            description: lesson.action_for_today,
            difficulty: 'medium',
            isFromDB: true
          }])
        }
      } finally {
        setIsLoadingActions(false)
      }
    }

    loadActions()
  }, [lesson, progress?.ai_actions])

  const handleToggleAction = async (actionId: number) => {
    const isCurrentlyCompleted = completedActions.includes(actionId)
    const newCompletedActions = isCurrentlyCompleted
      ? completedActions.filter(id => id !== actionId)
      : [...completedActions, actionId]
    
    setCompletedActions(newCompletedActions)

    try {
      await toggleActionCompleted(lesson.day_number, actionId, !isCurrentlyCompleted)
    } catch (error) {
      setCompletedActions(completedActions)
      toast.error("Failed to update action")
    }
  }

  const actionsCompletedCount = completedActions.length
  const totalActionsCount = actions.length
  const actionsProgress = totalActionsCount > 0 ? Math.round((actionsCompletedCount / totalActionsCount) * 100) : 0

  const handleComplete = async () => {
    if (!reflection.trim()) {
      toast.error("Please write a reflection before completing this lesson")
      return
    }

    setIsSubmitting(true)
    try {
      // Get the current session to ensure we have a valid auth token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        console.error("[v0] Session error:", sessionError)
        toast.error("Session expired. Please log in again.")
        router.push("/auth/login")
        return
      }

      const currentUserId = session.user.id

      // Check if progress already exists
      const { data: existingProgress, error: checkError } = await supabase
        .from("user_progress")
        .select("id")
        .eq("user_id", currentUserId)
        .eq("day_number", lesson.day_number)
        .maybeSingle()

      if (checkError) {
        console.error("[v0] Check error:", checkError)
        throw checkError
      }

      let progressError;
      
      if (existingProgress) {
        // Update existing progress
        const { error } = await supabase
          .from("user_progress")
          .update({
            completed: true,
            completed_at: new Date().toISOString(),
            reflection_text: reflection,
            points_awarded: 10,
          })
          .eq("id", existingProgress.id)
        progressError = error
      } else {
        // Insert new progress
        const { error } = await supabase
          .from("user_progress")
          .insert({
            user_id: currentUserId,
            day_number: lesson.day_number,
            completed: true,
            completed_at: new Date().toISOString(),
            reflection_text: reflection,
            points_awarded: 10,
          })
        progressError = error
      }

      if (progressError) throw progressError

      setIsCompleted(true)
      toast.success("Framework applied! +10 Leadership Credits")
      router.refresh()
    } catch (error: unknown) {
      console.error("[v0] Error completing lesson:", error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      toast.error(`Failed to save progress: ${errorMessage}`)
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
            All Frameworks
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
        <div className={cn(
          "flex h-16 w-16 items-center justify-center rounded-xl text-2xl font-bold flex-shrink-0",
          phase.bg, phase.text
        )}>
          {phase.letter}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge className={cn("text-xs font-medium", phase.bg, phase.text)}>
              {phase.name}
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
          <p className={cn("mt-1", phase.textLight)}>
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
                  <Lightbulb className="h-5 w-5 text-signal-i" />
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

          {/* Today's Actions Section */}
          <Card className={cn("border", phase.border)}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className={cn("p-1.5 rounded-lg", phase.bgLight)}>
                    <Target className={cn("h-4 w-4", phase.textLight)} />
                  </div>
                  Today&apos;s Actions
                </CardTitle>
                <span className="text-sm text-muted-foreground">
                  {actionsCompletedCount}/{totalActionsCount} completed
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {/* Actions Progress */}
              <div className="mb-4">
                <div className={cn("h-2 rounded-full overflow-hidden", phase.bgLight)}>
                  <div 
                    className={cn("h-full rounded-full transition-all duration-500", phase.bg)}
                    style={{ width: `${actionsProgress}%` }}
                  />
                </div>
              </div>

              {/* Actions List */}
              {isLoadingActions ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className={cn("h-6 w-6 animate-spin", phase.textLight)} />
                  <span className="ml-2 text-muted-foreground">Generating personalized actions...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {actions.map((action) => {
                    const isActionCompleted = completedActions.includes(action.id)
                    return (
                      <div 
                        key={action.id}
                        onClick={() => handleToggleAction(action.id)}
                        className={cn(
                          "flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all",
                          isActionCompleted 
                            ? "bg-slate-50 border-slate-200" 
                            : "bg-card border-border hover:border-slate-300 hover:shadow-sm"
                        )}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {isActionCompleted ? (
                            <CheckSquare className={cn("h-5 w-5", phase.textLight)} />
                          ) : (
                            <Square className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4 className={cn(
                              "font-medium text-sm",
                              isActionCompleted ? "line-through text-muted-foreground" : "text-foreground"
                            )}>
                              {action.title}
                            </h4>
                            <span className={cn(
                              "px-2 py-0.5 text-[10px] font-medium rounded-full uppercase",
                              getDifficultyColor(action.difficulty)
                            )}>
                              {action.difficulty}
                            </span>
                            {action.isFromDB && (
                              <span className={cn("px-2 py-0.5 text-[10px] font-medium rounded-full uppercase", phase.bgLight, phase.textLight)}>
                                Core
                              </span>
                            )}
                          </div>
                          <p className={cn(
                            "text-sm",
                            isActionCompleted ? "text-muted-foreground/70" : "text-muted-foreground"
                          )}>
                            {action.description}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {actions.length > 0 && !isLoadingActions && (
                <p className="text-xs text-muted-foreground mt-4 text-center">
                  <Sparkles className="h-3 w-3 inline mr-1" />
                  Actions are personalized based on today&apos;s lesson theme
                </p>
              )}
            </CardContent>
          </Card>

          {/* Strategic Reflection */}
          <Card className="card-executive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-bold tracking-tight">
                <Sparkles className="h-5 w-5 text-accent" />
                Strategic Reflection
              </CardTitle>
              <CardDescription>
                Capture your key insights and how this framework applies to your leadership context.
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
                  className="w-full sm:w-auto btn-executive text-white"
                >
                  {isSubmitting ? "Applying..." : "Apply Framework"} 
                  <CheckCircle2 className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <div className="flex items-center gap-2 text-signal-g p-3 bg-signal-g-light rounded-lg">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Framework Applied on {new Date(progress?.completed_at || "").toLocaleDateString()}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Progress Card */}
          <Card className={cn("border", phase.border)}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Day Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full",
                    lesson.leader_example ? cn(phase.bgLight, phase.textLight) : "bg-muted text-muted-foreground"
                  )}>
                    {lesson.leader_example ? <CheckCircle2 className="h-4 w-4" /> : "1"}
                  </div>
                  <span className="text-sm">Read leadership insight</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full",
                    lesson.thought_to_work_on ? cn(phase.bgLight, phase.textLight) : "bg-muted text-muted-foreground"
                  )}>
                    {lesson.thought_to_work_on ? <CheckCircle2 className="h-4 w-4" /> : "2"}
                  </div>
                  <span className="text-sm">Reflect on the thought</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full",
                    actionsCompletedCount > 0 ? cn(phase.bgLight, phase.textLight) : "bg-muted text-muted-foreground"
                  )}>
                    {actionsCompletedCount > 0 ? <CheckCircle2 className="h-4 w-4" /> : "3"}
                  </div>
                  <span className="text-sm">Complete actions ({actionsCompletedCount}/{totalActionsCount})</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full",
                    isCompleted ? cn(phase.bgLight, phase.textLight) : "bg-muted text-muted-foreground"
                  )}>
                    {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : "4"}
                  </div>
                  <span className="text-sm">Write reflection</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Quote */}
          {lesson.thought_to_work_on && (
            <Card className={cn("border", phase.border)}>
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <Quote className={cn("h-5 w-5 flex-shrink-0 mt-0.5", phase.textLight)} />
                  <div>
                    <p className="text-sm italic text-foreground leading-relaxed">
                      &ldquo;{lesson.thought_to_work_on}&rdquo;
                    </p>
                    <p className={cn("text-xs mt-2 font-medium", phase.textLight)}>
                      Today&apos;s Reflection Focus
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tips */}
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 card-executive">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Strategic Reflection Tips</CardTitle>
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
