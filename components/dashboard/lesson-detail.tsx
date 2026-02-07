"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ProgressRing } from "@/components/ui/progress-ring"
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
  Loader2,
  Brain,
  Compass,
  Zap,
  Copy,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Flame
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"
import { generateBoldActions, toggleActionCompleted, saveActionsToProgress } from "@/app/actions/ai-actions"
import { MarkdownContent } from "@/components/ui/markdown-content"

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
  quote?: string | null
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
  { letter: "S", name: "Self-Awareness", dayStart: 1, dayEnd: 15, bg: "bg-signal-s", text: "text-white", bgLight: "bg-signal-s-light", textLight: "text-signal-s", border: "border-signal-s/30", stroke: "stroke-signal-s" },
  { letter: "I", name: "Interpretation", dayStart: 16, dayEnd: 30, bg: "bg-signal-i", text: "text-white", bgLight: "bg-signal-i-light", textLight: "text-signal-i", border: "border-signal-i/30", stroke: "stroke-signal-i" },
  { letter: "G", name: "Goals & Strategy", dayStart: 31, dayEnd: 45, bg: "bg-signal-g", text: "text-white", bgLight: "bg-signal-g-light", textLight: "text-signal-g", border: "border-signal-g/30", stroke: "stroke-signal-g" },
  { letter: "N", name: "Navigation", dayStart: 46, dayEnd: 60, bg: "bg-signal-n", text: "text-white", bgLight: "bg-signal-n-light", textLight: "text-signal-n", border: "border-signal-n/30", stroke: "stroke-signal-n" },
  { letter: "A", name: "Action & Execution", dayStart: 61, dayEnd: 75, bg: "bg-signal-a", text: "text-white", bgLight: "bg-signal-a-light", textLight: "text-signal-a", border: "border-signal-a/30", stroke: "stroke-signal-a" },
  { letter: "L", name: "Leadership Identity", dayStart: 76, dayEnd: 90, bg: "bg-signal-l", text: "text-white", bgLight: "bg-signal-l-light", textLight: "text-signal-l", border: "border-signal-l/30", stroke: "stroke-signal-l" },
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

// Strategic tips data
const strategicTips = [
  {
    icon: Brain,
    title: "Be Specific",
    description: "Reference concrete situations and conversations from your leadership context.",
  },
  {
    icon: Compass,
    title: "Connect Insights",
    description: "Link today's framework to real challenges you're currently facing.",
  },
  {
    icon: Zap,
    title: "Note Emotions",
    description: "Capture how insights make you feel—resistance often signals growth areas.",
  },
  {
    icon: Target,
    title: "Actionable Steps",
    description: "End with at least one specific next step you'll take today or tomorrow.",
  },
]

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
  const [showJournal, setShowJournal] = useState(false)
  const [journalNote, setJournalNote] = useState("")
  const [expandedTip, setExpandedTip] = useState<number | null>(null)
  const [justCompleted, setJustCompleted] = useState<number | null>(null)
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

    // Trigger animation for completion
    if (!isCurrentlyCompleted) {
      setJustCompleted(actionId)
      setTimeout(() => setJustCompleted(null), 1000)
    }

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

  // Calculate overall day progress
  const progressSteps = [
    lesson.leader_example ? 1 : 0,
    lesson.thought_to_work_on ? 1 : 0,
    actionsCompletedCount > 0 ? 1 : 0,
    isCompleted ? 1 : 0,
  ]
  const completedSteps = progressSteps.filter(Boolean).length
  const totalSteps = 4
  const dayProgress = Math.round((completedSteps / totalSteps) * 100)

  const handleComplete = async () => {
    if (!reflection.trim()) {
      toast.error("Please write a reflection before completing this lesson")
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

      const currentUserId = session.user.id

      const { data: existingProgress, error: checkError } = await supabase
        .from("user_progress")
        .select("id")
        .eq("user_id", currentUserId)
        .eq("day_number", lesson.day_number)
        .maybeSingle()

      if (checkError) throw checkError

      let progressError;
      
      if (existingProgress) {
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
      const errorMessage = error instanceof Error ? error.message : String(error)
      toast.error(`Failed to save progress: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCopyQuote = () => {
    if (lesson.quote) {
      navigator.clipboard.writeText(lesson.quote)
      toast.success("Quote copied to clipboard")
    }
  }

  const handleSaveQuote = () => {
    toast.success("Quote saved to your collection")
  }

  if (isLocked) {
    return (
      <div className="max-w-3xl mx-auto animate-fade-in">
        <Card className="shadow-lg">
          <CardContent className="py-16 text-center">
            <Lock className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-2">Day {lesson.day_number} is Locked</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Complete your previous days to unlock this lesson. You&apos;re currently on Day {currentDay}.
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
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Navigation */}
      <div className="flex items-center justify-between animate-slide-down">
        {prevLesson ? (
          <Link href={`/dashboard/lessons/${prevLesson.day_number}`}>
            <Button variant="ghost" size="sm" className="hover:bg-muted/80 transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Day {prevLesson.day_number}
            </Button>
          </Link>
        ) : (
          <div />
        )}
        <Link href="/dashboard/lessons">
          <Button variant="outline" size="sm" className="hover:shadow-sm transition-all">
            <BookOpen className="mr-2 h-4 w-4" />
            All Frameworks
          </Button>
        </Link>
        {nextLesson && lesson.day_number < currentDay ? (
          <Link href={`/dashboard/lessons/${nextLesson.day_number}`}>
            <Button variant="ghost" size="sm" className="hover:bg-muted/80 transition-colors">
              Day {nextLesson.day_number}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <div />
        )}
      </div>

      {/* Session Header - Emotional Entry Point */}
      <div className="relative animate-slide-up" style={{ animationDelay: '60ms' }}>
        {/* Premium Header Card */}
        <Card className={cn(
          "overflow-hidden border-0 shadow-lg",
          "bg-gradient-to-br from-card via-card to-muted/30"
        )}>
          <div className={cn("absolute top-0 left-0 w-1 h-full", phase.bg)} />
          <CardContent className="p-6 sm:p-8">
            {/* Top Row: Badge + Day indicator */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <Badge className={cn(
                  "px-3 py-1.5 text-xs font-semibold tracking-wide border-0",
                  phase.bg, phase.text
                )}>
                  {phase.name}
                </Badge>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  SIGNAL Phase {phase.letter}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium">Day {lesson.day_number}</span>
                <span className="text-muted-foreground/50">/</span>
                <span>90</span>
                {isCompleted && (
                  <Badge variant="secondary" className="gap-1 ml-2 animate-bounce-once">
                    <CheckCircle2 className="h-3 w-3" />
                    Complete
                  </Badge>
                )}
              </div>
            </div>

            {/* Session Label */}
            <p className={cn("text-xs uppercase tracking-widest font-medium mb-3", phase.textLight)}>
              Today&apos;s Leadership Signal
            </p>

            {/* Main Title */}
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance leading-tight mb-4">
              <MarkdownContent content={lesson.focus_reframe_technique || `Day ${lesson.day_number} Focus`} inline />
            </h1>

            {/* Emotional Context Line */}
            <div className="text-muted-foreground leading-relaxed max-w-2xl">
              {lesson.focus_area ? (
                <p>Today we explore how leaders <span className={cn("font-medium", phase.textLight)}><MarkdownContent content={lesson.focus_area.toLowerCase()} inline /></span>.</p>
              ) : (
                <p>Building pattern recognition through focused leadership practice.</p>
              )}
            </div>

            {/* Streak indicator (mock for now) */}
            <div className="flex items-center gap-2 mt-5 pt-5 border-t border-border/50">
              <Flame className={cn("h-4 w-4", phase.textLight)} />
              <span className="text-sm text-muted-foreground">
                Consistency builds executive intuition. <span className="font-medium text-foreground">Day {lesson.day_number} active.</span>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid - Redesigned Flow */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Primary Content Column - 8 cols */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* 1. Leadership Insight Card - Authority Anchor */}
          {lesson.leader_example && (
            <Card className={cn(
              "group overflow-hidden transition-all duration-300 animate-slide-up",
              "shadow-md hover:shadow-lg border-0"
            )} style={{ animationDelay: '120ms' }}>
              <div className={cn("absolute top-0 left-0 w-1 h-full", phase.bg)} />
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3 text-lg font-bold">
                    <div className={cn("p-2 rounded-xl", phase.bgLight)}>
                      <Quote className={cn("h-5 w-5", phase.textLight)} />
                    </div>
                    Leadership Insight
                  </CardTitle>
                  <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider font-medium", phase.textLight, phase.border)}>
                    Leadership Pattern
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className={cn("rounded-xl p-5", phase.bgLight)}>
                  <div className="text-lg font-medium text-foreground leading-relaxed">
                    <MarkdownContent content={lesson.leader_example!} className="text-lg font-medium text-foreground" />
                  </div>
                  {lesson.leader_context && (
                    <div className="text-sm text-muted-foreground mt-4 pt-4 border-t border-border/30">
                      <MarkdownContent content={lesson.leader_context} className="text-sm text-muted-foreground" />
                    </div>
                  )}
                  {lesson.leader_story_id && (
                    <p className={cn("text-xs mt-3 uppercase tracking-wider font-semibold", phase.textLight)}>
                      {lesson.leader_story_id}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 2. Thought to Work On - Interactive Cognitive Trigger */}
          {lesson.thought_to_work_on && (
            <Card className={cn(
              "group overflow-hidden transition-all duration-300 animate-slide-up",
              "shadow-md hover:shadow-lg border-0",
              "relative"
            )} style={{ animationDelay: '180ms' }}>
              {/* Glow Effect on Hover */}
              <div className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
                "bg-gradient-to-r from-transparent via-accent/5 to-transparent"
              )} />
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-lg font-bold">
                  <div className="p-2 rounded-xl bg-amber-500/10">
                    <Lightbulb className="h-5 w-5 text-amber-600" />
                  </div>
                  Thought to Work On
                </CardTitle>
                <CardDescription>
                  A cognitive trigger to shift your leadership perspective today.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-foreground leading-relaxed text-lg">
                  <MarkdownContent content={lesson.thought_to_work_on!} className="text-foreground text-lg" />
                </div>
                
                {/* Interactive Reflect Section */}
                <div className={cn(
                  "rounded-xl border-2 border-dashed transition-all duration-300",
                  showJournal ? cn("border-solid", phase.border, phase.bgLight) : "border-muted-foreground/20 hover:border-muted-foreground/40"
                )}>
                  {!showJournal ? (
                    <button
                      onClick={() => setShowJournal(true)}
                      className="w-full p-4 text-left flex items-center justify-between group/reflect"
                    >
                      <div className="flex items-center gap-3">
                        <Sparkles className={cn("h-5 w-5 text-muted-foreground group-hover/reflect:text-foreground transition-colors", phase.textLight)} />
                        <span className="text-sm font-medium text-muted-foreground group-hover/reflect:text-foreground transition-colors">
                          Reflect on this thought...
                        </span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover/reflect:translate-x-1 transition-transform" />
                    </button>
                  ) : (
                    <div className="p-4 space-y-3">
                      <Textarea
                        placeholder="How does this thought challenge or resonate with your current leadership approach?"
                        value={journalNote}
                        onChange={(e) => setJournalNote(e.target.value)}
                        rows={4}
                        className="resize-none border-0 bg-transparent focus-visible:ring-0 p-0 text-foreground placeholder:text-muted-foreground/60"
                      />
                      <div className="flex items-center justify-between pt-2 border-t border-border/30">
                        <span className="text-xs text-muted-foreground">Auto-saves as you type</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowJournal(false)}
                          className="text-xs"
                        >
                          Minimize
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 3. Reflection Quote - Emotional Layer (moved here per UX spec) */}
          {lesson.quote && (
            <Card className={cn(
              "overflow-hidden border-0 shadow-md animate-slide-up",
              "bg-gradient-to-br from-muted/30 via-card to-card"
            )} style={{ animationDelay: '240ms' }}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Quote className={cn("h-8 w-8 flex-shrink-0 mt-1", phase.textLight)} />
                  <div className="flex-1">
                    <div className="text-lg italic text-foreground leading-relaxed">
                      <MarkdownContent content={lesson.quote!} className="text-lg italic text-foreground" />
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30">
                      <p className={cn("text-xs uppercase tracking-wider font-semibold", phase.textLight)}>
                        Reflection Anchor
                      </p>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={handleCopyQuote} className="h-8 w-8 p-0">
                          <Copy className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleSaveQuote} className="h-8 w-8 p-0">
                          <Bookmark className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 4. Today's Actions - Behavioral Energy */}
          <Card className={cn(
            "overflow-hidden transition-all duration-300 animate-slide-up",
            "shadow-md border-0"
          )} style={{ animationDelay: '300ms' }}>
            <div className={cn("absolute top-0 left-0 w-1 h-full", phase.bg)} />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-lg font-bold">
                  <div className={cn("p-2 rounded-xl", phase.bgLight)}>
                    <Target className={cn("h-5 w-5", phase.textLight)} />
                  </div>
                  Today&apos;s Actions
                </CardTitle>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground">
                    {actionsCompletedCount}/{totalActionsCount}
                  </span>
                  <span className="text-sm text-muted-foreground">completed</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Progress Bar */}
              <div className="mb-6">
                <div className={cn("h-2 rounded-full overflow-hidden", phase.bgLight)}>
                  <div 
                    className={cn("h-full rounded-full transition-all duration-700 ease-out", phase.bg)}
                    style={{ width: `${actionsProgress}%` }}
                  />
                </div>
              </div>

              {/* Actions List */}
              {isLoadingActions ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className={cn("h-6 w-6 animate-spin", phase.textLight)} />
                  <span className="ml-3 text-muted-foreground">Generating personalized actions...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {actions.map((action, index) => {
                    const isActionCompleted = completedActions.includes(action.id)
                    const wasJustCompleted = justCompleted === action.id
                    return (
                      <div 
                        key={action.id}
                        onClick={() => handleToggleAction(action.id)}
                        className={cn(
                          "relative flex items-start gap-4 p-5 rounded-xl cursor-pointer transition-all duration-300",
                          "border-l-4",
                          isActionCompleted 
                            ? "bg-muted/50 border-l-muted-foreground/30" 
                            : cn("bg-card border hover:shadow-md hover:-translate-y-0.5", phase.border),
                          wasJustCompleted && "animate-celebrate"
                        )}
                        style={{ animationDelay: `${index * 60}ms` }}
                      >
                        {/* Checkbox */}
                        <div className={cn(
                          "flex-shrink-0 mt-0.5 transition-transform duration-300",
                          isActionCompleted && "scale-110"
                        )}>
                          {isActionCompleted ? (
                            <CheckSquare className={cn("h-6 w-6", phase.textLight)} />
                          ) : (
                            <Square className="h-6 w-6 text-muted-foreground hover:text-foreground transition-colors" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h4 className={cn(
                              "font-semibold transition-all duration-300",
                              isActionCompleted ? "line-through text-muted-foreground" : "text-foreground"
                            )}>
                              {action.title}
                            </h4>
                            <span className={cn(
                              "px-2.5 py-1 text-[10px] font-semibold rounded-full uppercase tracking-wide",
                              getDifficultyColor(action.difficulty)
                            )}>
                              {action.difficulty}
                            </span>
                            {action.isFromDB && (
                              <span className={cn(
                                "px-2.5 py-1 text-[10px] font-semibold rounded-full uppercase tracking-wide",
                                phase.bgLight, phase.textLight
                              )}>
                                Core
                              </span>
                            )}
                          </div>
                          <p className={cn(
                            "text-sm leading-relaxed transition-all duration-300",
                            isActionCompleted ? "text-muted-foreground/60" : "text-muted-foreground"
                          )}>
                            {action.description}
                          </p>
                          
                          {/* Mini Progress Indicator */}
                          {!isActionCompleted && (
                            <div className="mt-3 flex items-center gap-2">
                              <div className={cn("h-1 flex-1 rounded-full", phase.bgLight)}>
                                <div className={cn("h-full rounded-full w-0", phase.bg)} />
                              </div>
                              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Ready</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Motivation Message */}
              {actionsCompletedCount > 0 && actionsCompletedCount === totalActionsCount && !isLoadingActions && (
                <div className={cn(
                  "mt-6 p-4 rounded-xl text-center animate-fade-in",
                  phase.bgLight
                )}>
                  <p className={cn("font-medium", phase.textLight)}>
                    You are building pattern recognition.
                  </p>
                </div>
              )}

              {actions.length > 0 && !isLoadingActions && actionsCompletedCount < totalActionsCount && (
                <p className="text-xs text-muted-foreground mt-6 text-center">
                  <Sparkles className="h-3 w-3 inline mr-1" />
                  Actions personalized for today&apos;s leadership theme
                </p>
              )}
            </CardContent>
          </Card>

          {/* 5. Strategic Reflection - Now with Journal */}
          <Card className={cn(
            "overflow-hidden shadow-lg animate-slide-up",
            "bg-gradient-to-br from-card via-card to-primary/5 border-0"
          )} style={{ animationDelay: '360ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-bold tracking-tight">
                <Sparkles className="h-6 w-6 text-accent" />
                Strategic Reflection
              </CardTitle>
              <CardDescription className="text-base">
                Capture your key insights and how this framework applies to your leadership context.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <Textarea
                placeholder="What resonated with you today? How will you apply this insight? What challenges do you anticipate?"
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                rows={6}
                disabled={isCompleted}
                className="resize-none text-base border-muted focus:border-accent transition-colors"
              />
              {!isCompleted ? (
                <Button 
                  onClick={handleComplete} 
                  disabled={isSubmitting || !reflection.trim()}
                  className="w-full sm:w-auto btn-executive text-white text-base py-5 px-8"
                >
                  {isSubmitting ? "Applying..." : "Apply Framework"} 
                  <CheckCircle2 className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <div className={cn(
                  "flex items-center gap-3 p-4 rounded-xl animate-fade-in",
                  phase.bgLight
                )}>
                  <CheckCircle2 className={cn("h-6 w-6", phase.textLight)} />
                  <span className={cn("font-medium", phase.textLight)}>
                    Framework Applied on {new Date(progress?.completed_at || "").toLocaleDateString()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column - 4 cols */}
        <div className="lg:col-span-4 space-y-6">
          {/* Day Progress - Circular Ring */}
          <Card className={cn(
            "overflow-hidden border-0 shadow-md animate-slide-up"
          )} style={{ animationDelay: '180ms' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">Day Progress</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-4">
              <ProgressRing 
                value={dayProgress} 
                size={140}
                strokeWidth={10}
                indicatorClassName={phase.stroke}
                trackClassName={phase.bgLight.replace('bg-', 'stroke-')}
                label="complete"
              />
              
              {/* Progress Steps */}
              <div className="w-full mt-6 space-y-2">
                {[
                  { label: "Read leadership insight", done: !!lesson.leader_example },
                  { label: "Reflect on the thought", done: !!lesson.thought_to_work_on },
                  { label: `Complete actions (${actionsCompletedCount}/${totalActionsCount})`, done: actionsCompletedCount > 0 },
                  { label: "Write reflection", done: isCompleted },
                ].map((step, i) => (
                  <div key={i} className={cn(
                    "flex items-center gap-3 p-2 rounded-lg transition-colors",
                    step.done && phase.bgLight
                  )}>
                    <div className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium transition-all",
                      step.done 
                        ? cn(phase.bg, "text-white") 
                        : "bg-muted text-muted-foreground"
                    )}>
                      {step.done ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                    </div>
                    <span className={cn(
                      "text-sm transition-colors",
                      step.done ? "text-foreground font-medium" : "text-muted-foreground"
                    )}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Next Step CTA */}
              {!isCompleted && (
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => {
                    const reflectionSection = document.querySelector('[data-reflection]')
                    reflectionSection?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  Continue Session
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Next Unlock Preview */}
          {nextLesson && (
            <Card className={cn(
              "overflow-hidden border-0 shadow-md animate-slide-up",
              "bg-gradient-to-br from-muted/50 to-card"
            )} style={{ animationDelay: '240ms' }}>
              <CardContent className="p-5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Up Next</p>
                <p className="font-semibold text-foreground mb-1">
                  Day {nextLesson.day_number}: {nextLesson.focus_reframe_technique || "Next Framework"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isCompleted ? "Ready to unlock" : "Complete today to unlock"}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Strategic Tips - Card Stack */}
          <Card className={cn(
            "overflow-hidden border-0 shadow-md animate-slide-up",
            "bg-gradient-to-br from-primary/5 to-accent/5"
          )} style={{ animationDelay: '300ms' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Strategic Reflection Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {strategicTips.map((tip, index) => {
                const Icon = tip.icon
                const isExpanded = expandedTip === index
                return (
                  <div
                    key={index}
                    className={cn(
                      "rounded-xl border border-border/50 bg-card/50 transition-all duration-300 cursor-pointer",
                      isExpanded && "shadow-sm"
                    )}
                  >
                    <button
                      onClick={() => setExpandedTip(isExpanded ? null : index)}
                      className="w-full p-3 flex items-center gap-3 text-left"
                    >
                      <Icon className={cn("h-4 w-4 flex-shrink-0", phase.textLight)} />
                      <span className="text-sm font-medium text-foreground flex-1">{tip.title}</span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="px-3 pb-3 pt-0">
                        <p className="text-sm text-muted-foreground pl-7">{tip.description}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
