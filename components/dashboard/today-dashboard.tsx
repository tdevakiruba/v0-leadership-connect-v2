"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { User } from "@supabase/supabase-js"
import { 
  Flame, 
  Zap, 
  Target, 
  CheckCircle2, 
  Sparkles, 
  Play, 
  Clock, 
  Trophy,
  Star,
  Calendar,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Square,
  CheckSquare,
  TrendingUp,
  Quote,
  ChevronRight,
  ExternalLink,
  Video
} from "lucide-react"
import Link from "next/link"
import { generateBoldActions, toggleActionCompleted, saveActionsToProgress } from "@/app/actions/ai-actions"
import { MarkdownContent } from "@/components/ui/markdown-content"
import { ProgressRing } from "@/components/ui/progress-ring"

// Two-tone quote display component with markdown support
function QuoteDisplay({ quote }: { quote: string }) {
  // Strip markdown for the two-tone split logic but render with markdown
  const plainText = quote.replace(/[*_~`#>\[\]()!]/g, "").replace(/\s+/g, " ").trim()
  const words = plainText.split(" ")
  const midPoint = Math.ceil(words.length / 2)
  
  // Try to find a comma or natural break point near the middle
  let breakIndex = midPoint
  for (let i = midPoint - 2; i <= midPoint + 2 && i < words.length; i++) {
    if (i > 0 && (words[i-1].includes(",") || words[i-1].includes("."))) {
      breakIndex = i
      break
    }
  }
  
  // Find the position of the break word in the original markdown string
  const breakWord = words[breakIndex - 1]
  const breakPos = quote.indexOf(breakWord) + breakWord.length
  const firstPart = quote.slice(0, breakPos).trim()
  const secondPart = quote.slice(breakPos).trim()
  
  return (
    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-balance">
      <span className="text-foreground"><MarkdownContent content={firstPart} inline /></span>
      {secondPart && (
        <>
          {" "}
          <span className="text-signal-s"><MarkdownContent content={secondPart} inline /></span>
        </>
      )}
    </h2>
  )
}

// SIGNAL™ phase color configurations - Monochromatic Blue-Teal Gradient Palette
const signalPhases = [
  {
    letter: "S",
    name: "Self-Awareness",
    dayStart: 1,
    dayEnd: 15,
    bgActive: "bg-signal-s-light",
    textActive: "text-signal-s",
    bgDone: "bg-signal-s",
    textDone: "text-white",
    progressActive: "bg-signal-s/70",
    progressDone: "bg-signal-s",
    borderActive: "border-signal-s/30",
  },
  {
    letter: "I",
    name: "Interpretation",
    dayStart: 16,
    dayEnd: 30,
    bgActive: "bg-signal-i-light",
    textActive: "text-signal-i",
    bgDone: "bg-signal-i",
    textDone: "text-white",
    progressActive: "bg-signal-i/70",
    progressDone: "bg-signal-i",
    borderActive: "border-signal-i/30",
  },
  {
    letter: "G",
    name: "Goals & Strategy",
    dayStart: 31,
    dayEnd: 45,
    bgActive: "bg-signal-g-light",
    textActive: "text-signal-g",
    bgDone: "bg-signal-g",
    textDone: "text-white",
    progressActive: "bg-signal-g/70",
    progressDone: "bg-signal-g",
    borderActive: "border-signal-g/30",
  },
  {
    letter: "N",
    name: "Navigation",
    dayStart: 46,
    dayEnd: 60,
    bgActive: "bg-signal-n-light",
    textActive: "text-signal-n",
    bgDone: "bg-signal-n",
    textDone: "text-white",
    progressActive: "bg-signal-n/70",
    progressDone: "bg-signal-n",
    borderActive: "border-signal-n/30",
  },
  {
    letter: "A",
    name: "Action & Execution",
    dayStart: 61,
    dayEnd: 75,
    bgActive: "bg-signal-a-light",
    textActive: "text-signal-a",
    bgDone: "bg-signal-a",
    textDone: "text-white",
    progressActive: "bg-signal-a/70",
    progressDone: "bg-signal-a",
    borderActive: "border-signal-a/30",
  },
  {
    letter: "L",
    name: "Leadership Identity",
    dayStart: 76,
    dayEnd: 90,
    bgActive: "bg-signal-l-light",
    textActive: "text-signal-l",
    bgDone: "bg-signal-l",
    textDone: "text-white",
    progressActive: "bg-signal-l/70",
    progressDone: "bg-signal-l",
    borderActive: "border-signal-l/30",
  },
]

interface ActionItem {
  id: number
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'bold'
  isFromDB?: boolean
}

interface OfficeHours {
  id: string
  title: string
  scheduled_at: string
  meeting_url: string
  description: string | null
  status: string
}

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
    quote: string | null
  } | null
  todayProgress: {
    id: string
    completed: boolean
    reflection_text: string | null
    ai_action: string | null
    actions_completed?: number[]
    ai_actions?: ActionItem[]
  } | null
  completedDays: number
  streak: number
  totalPoints: number
  nextOfficeHours?: OfficeHours | null
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
  nextOfficeHours,
}: TodayDashboardProps) {
  const [reflection, setReflection] = useState(todayProgress?.reflection_text || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(todayProgress?.completed || false)
  const [actions, setActions] = useState<ActionItem[]>([])
  const [completedActions, setCompletedActions] = useState<number[]>(todayProgress?.actions_completed || [])
  const [isLoadingActions, setIsLoadingActions] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const progressPercentage = Math.round((completedDays / 90) * 100)
  const firstName = profile?.full_name?.split(" ")[0] || user.email?.split("@")[0] || "Leader"

  // Get the current phase colors
  const currentPhaseColors = signalPhases.find(
    p => currentDay >= p.dayStart && currentDay <= p.dayEnd
  ) || signalPhases[0]

  // Load or generate actions on mount
  useEffect(() => {
    async function loadActions() {
      if (!todayLesson) return

      // If we have cached AI actions, use them
      if (todayProgress?.ai_actions && todayProgress.ai_actions.length > 0) {
        // Add the DB action as the first item
        const allActions: ActionItem[] = []
        if (todayLesson.action_for_today) {
          allActions.push({
            id: 0,
            title: "Today's Core Action",
            description: todayLesson.action_for_today,
            difficulty: 'medium',
            isFromDB: true
          })
        }
        allActions.push(...todayProgress.ai_actions)
        setActions(allActions)
        return
      }

      // Generate new actions
      setIsLoadingActions(true)
      try {
        const result = await generateBoldActions(
          currentDay,
          todayLesson.focus_area,
          todayLesson.focus_reframe_technique || todayLesson.focus_area,
          todayLesson.action_for_today || ""
        )

        const allActions: ActionItem[] = []
        
        // Add the DB action as the first item
        if (todayLesson.action_for_today) {
          allActions.push({
            id: 0,
            title: "Today's Core Action",
            description: todayLesson.action_for_today,
            difficulty: 'medium',
            isFromDB: true
          })
        }

        // Add AI-generated actions with offset IDs
        const aiActions = result.actions.map((action, index) => ({
          ...action,
          id: index + 1
        }))
        allActions.push(...aiActions)
        
        setActions(allActions)

        // Save AI actions to database for caching
        await saveActionsToProgress(currentDay, aiActions)
      } catch (error) {
        console.error('[v0] Error loading actions:', error)
        // Fallback: just show the DB action
        if (todayLesson.action_for_today) {
          setActions([{
            id: 0,
            title: "Today's Core Action",
            description: todayLesson.action_for_today,
            difficulty: 'medium',
            isFromDB: true
          }])
        }
      } finally {
        setIsLoadingActions(false)
      }
    }

    loadActions()
  }, [todayLesson, todayProgress?.ai_actions, currentDay])

  const handleToggleAction = async (actionId: number) => {
    if (!todayLesson) return

    const isCurrentlyCompleted = completedActions.includes(actionId)
    const newCompletedActions = isCurrentlyCompleted
      ? completedActions.filter(id => id !== actionId)
      : [...completedActions, actionId]
    
    setCompletedActions(newCompletedActions)

    try {
      await toggleActionCompleted(currentDay, actionId, !isCurrentlyCompleted)
    } catch (error) {
      // Revert on error
      setCompletedActions(completedActions)
      toast.error("Failed to update action")
    }
  }

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
      toast.success("Framework applied! +10 Leadership Credits")
      router.refresh()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      toast.error(`Failed to save: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentPhase = getSIGNALPhase(currentDay)
  
  // Generate week days for the calendar
  const today = new Date()
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today)
    date.setDate(today.getDate() - today.getDay() + i)
    return {
      day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i],
      date: date.getDate(),
      isToday: date.toDateString() === today.toDateString(),
      isPast: date < today && date.toDateString() !== today.toDateString(),
    }
  })

  const actionsCompletedCount = completedActions.length
  const totalActionsCount = actions.length
  const actionsProgress = totalActionsCount > 0 ? Math.round((actionsCompletedCount / totalActionsCount) * 100) : 0

  // Calculate day progress for the progress ring
  const dayProgressSteps = [
    todayLesson?.leader_example ? 1 : 0,
    todayLesson?.thought_to_work_on ? 1 : 0,
    actionsCompletedCount > 0 ? 1 : 0,
    isCompleted ? 1 : 0,
  ]
  const dayProgress = Math.round((dayProgressSteps.filter(Boolean).length / 4) * 100)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-signal-s-light text-signal-s'
      case 'medium': return 'bg-signal-g-light text-signal-g'
      case 'bold': return 'bg-signal-l-light text-signal-l'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  return (
    <div className="min-h-screen">
      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
 {/* Quote of the Day - Executive Two-Tone Style */}
  {todayLesson?.quote && (
  <div className="relative bg-gradient-to-br from-slate-50 via-white to-signal-s-light/20 rounded-2xl p-10 lg:p-12 border border-border/50 card-executive overflow-hidden">
  {/* Decorative background elements */}
  <div className="absolute inset-0 opacity-[0.03]">
    <div className="absolute top-0 right-0 w-64 h-64 bg-signal-s rounded-full blur-3xl" />
    <div className="absolute bottom-0 left-0 w-48 h-48 bg-signal-n rounded-full blur-3xl" />
  </div>
  <div className="relative z-10 text-center">
    <p className="text-sm font-semibold text-signal-s tracking-wide uppercase mb-4 flex items-center justify-center gap-2">
      <Sparkles className="h-4 w-4" />
      Today&apos;s Leadership Insight
    </p>
    <QuoteDisplay quote={todayLesson.quote} />
    <div className="flex items-center justify-center gap-2 mt-6 text-sm text-muted-foreground">
      <Calendar className="h-4 w-4" />
      {today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
    </div>
  </div>
  </div>
  )}

          {/* Welcome Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Welcome back, {firstName}
              </h1>
              <p className="text-muted-foreground mt-1">
                Your leadership edge sharpens with every session.
              </p>
            </div>
            {!todayLesson?.quote && (
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </div>
            )}
          </div>

          {/* Today's Leadership Focus */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold tracking-tight text-foreground section-title-executive">Today&apos;s Leadership Focus</h2>
              <Link href="/dashboard/lessons" className={cn("text-sm font-medium hover:opacity-80 flex items-center gap-1", currentPhaseColors.textActive)}>
                All Frameworks <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            
            {todayLesson && (
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Current Framework Card with Day Progress */}
                <div className={cn("bg-card rounded-2xl p-5 border-2 card-executive hover:shadow-lg transition-all group", currentPhaseColors.borderActive)}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn("p-2.5 rounded-xl", currentPhaseColors.bgActive)}>
                      <BookOpen className={cn("h-5 w-5", currentPhaseColors.textActive)} />
                    </div>
                    <span className={cn("px-2.5 py-1 text-xs font-medium rounded-full", currentPhaseColors.bgActive, currentPhaseColors.textActive)}>
                      Day {currentDay}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-1 line-clamp-2">
                    <MarkdownContent content={todayLesson.focus_reframe_technique || todayLesson.focus_area} inline />
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4 uppercase tracking-wide">
                    <MarkdownContent content={todayLesson.focus_area} inline />
                  </p>

                  {/* Day Progress Ring */}
                  <div className="flex items-center gap-4 mb-4">
                    <ProgressRing 
                      value={dayProgress} 
                      size={72}
                      strokeWidth={6}
                      indicatorClassName={currentPhaseColors.textActive.replace('text-', 'stroke-')}
                      trackClassName={currentPhaseColors.bgActive.replace('bg-', 'stroke-')}
                      showValue={false}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-1.5 mb-0.5">
                        <span className={cn("text-2xl font-bold", currentPhaseColors.textActive)}>{dayProgress}%</span>
                        <span className="text-xs text-muted-foreground">today</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{completedDays}/90 Frameworks</span>
                        <span className={cn("font-semibold", currentPhaseColors.textActive)}>{progressPercentage}%</span>
                      </div>
                      <div className={cn("h-1.5 rounded-full overflow-hidden mt-1", currentPhaseColors.bgActive)}>
                        <div 
                          className={cn("h-full rounded-full transition-all duration-500", currentPhaseColors.progressDone)}
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Prominent CTA Button */}
                  <Link href={`/dashboard/lessons/${currentDay}`} className="block">
                    <Button 
                      className={cn(
                        "w-full font-semibold text-sm h-11 gap-2 transition-all shadow-sm",
                        isCompleted 
                          ? "bg-muted text-foreground hover:bg-muted/80" 
                          : cn(currentPhaseColors.progressDone, "text-white hover:opacity-90")
                      )}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Review Framework
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          Resume Framework
                          <ArrowRight className="h-4 w-4 ml-auto" />
                        </>
                      )}
                    </Button>
                  </Link>
                </div>

                {/* Navigation Links Card */}
                <div className="bg-card rounded-2xl p-5 border border-border card-executive">
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn("p-2.5 rounded-xl", currentPhaseColors.bgActive)}>
                      <TrendingUp className={cn("h-5 w-5", currentPhaseColors.textActive)} />
                    </div>
                    <span className={cn("px-2.5 py-1 text-xs font-semibold rounded-full", currentPhaseColors.bgActive, currentPhaseColors.textActive)}>
                      Day {currentDay} of 90
                    </span>
                  </div>
                  <h3 className="font-bold text-foreground mb-2 tracking-tight">
                    Framework Navigation
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Access previous or upcoming modules
                  </p>
                  
                  {/* Navigation Links */}
                  <div className="space-y-2">
                    {currentDay > 1 && (
                      <Link 
                        href={`/dashboard/lessons/${currentDay - 1}`}
                        className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-all group"
                      >
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <ArrowLeft className="h-4 w-4" />
                          <span>Previous Framework</span>
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">Day {currentDay - 1}</span>
                      </Link>
                    )}
                    {currentDay < 90 && (
                      <Link 
                        href={`/dashboard/lessons/${currentDay + 1}`}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-xl transition-all group",
                          isCompleted 
                            ? cn(currentPhaseColors.bgActive, "hover:opacity-80")
                            : "bg-muted/30 opacity-60 pointer-events-none"
                        )}
                      >
                        <div className={cn("flex items-center gap-2 text-sm", isCompleted ? currentPhaseColors.textActive : "text-muted-foreground")}>
                          <span>Next Framework</span>
                          <ArrowRight className="h-4 w-4" />
                        </div>
                        <span className={cn("text-xs font-medium", isCompleted ? currentPhaseColors.textActive : "text-muted-foreground")}>Day {currentDay + 1}</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Today's Strategic Actions */}
          {todayLesson && (
            <div className="bg-card rounded-2xl p-6 border border-border card-executive">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2.5 rounded-xl", currentPhaseColors.bgActive)}>
                    <Target className={cn("h-5 w-5", currentPhaseColors.textActive)} />
                  </div>
                  <h3 className="font-bold text-foreground tracking-tight section-title-executive">Strategic Actions</h3>
                </div>
                <span className={cn("text-sm font-semibold", currentPhaseColors.textActive)}>
                  {actionsCompletedCount}/{totalActionsCount} applied
                </span>
              </div>

              {/* Actions Progress */}
              <div className="mb-4">
                <div className={cn("h-2.5 rounded-full overflow-hidden bg-slate-100 progress-bar-executive")}>
                  <div 
                    className={cn("h-full rounded-full transition-all duration-500", currentPhaseColors.progressActive)}
                    style={{ width: `${actionsProgress}%` }}
                  />
                </div>
              </div>

              {/* Actions List */}
              {isLoadingActions ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className={cn("h-6 w-6 animate-spin", currentPhaseColors.textActive)} />
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
                            <CheckSquare className={cn("h-5 w-5", currentPhaseColors.textActive)} />
                          ) : (
                            <Square className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
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
                              <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-primary/10 text-primary uppercase">
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
            </div>
          )}

          {/* Strategic Reflection Section */}
          {todayLesson && (
            <div className="bg-card rounded-2xl p-6 border border-border card-executive">
              <div className="flex items-center gap-3 mb-1">
                <div className={cn("p-2.5 rounded-xl", currentPhaseColors.bgActive)}>
                  <Zap className={cn("h-5 w-5", currentPhaseColors.textActive)} />
                </div>
                <h3 className="font-bold text-foreground tracking-tight section-title-executive">Strategic Reflection</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4 ml-12">
                Capture your key insights and how this framework applies to your leadership context.
              </p>
              
              <textarea
                placeholder="What resonated with you today? How will you apply this insight? What challenges do you anticipate?"
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                disabled={isCompleted}
                rows={3}
                className={cn(
                  "w-full bg-muted text-foreground placeholder:text-muted-foreground",
                  "border border-border rounded-xl p-4",
                  "resize-none outline-none text-sm leading-relaxed",
                  "focus:ring-2 transition-all duration-200",
                  `focus:${currentPhaseColors.borderActive} focus:ring-${currentPhaseColors.bgActive}`
                )}
              />
              
              <div className="mt-4 flex items-center justify-between">
                {!isCompleted ? (
                  <Button 
                    onClick={handleComplete} 
                    disabled={isSubmitting || !reflection.trim()}
                    className="btn-executive text-white rounded-full px-8 py-2.5 h-auto font-semibold transition-all hover:opacity-90"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Applying..." : "Apply Framework"}
                  </Button>
                ) : (
                  <div className={cn("flex items-center gap-2 font-semibold", currentPhaseColors.textActive)}>
                    <CheckCircle2 className="h-5 w-5" />
                    Framework Applied
                  </div>
                )}
                <span className="text-sm text-muted-foreground">+10 Leadership Credits</span>
              </div>
            </div>
          )}

          {/* SIGNAL™ Leadership Pathway */}
          <div className="bg-card rounded-2xl p-6 border border-border card-executive">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground tracking-tight section-title-executive">Your SIGNAL&trade; Pathway</h3>
              <Link href="/dashboard/journey" className={cn("text-sm font-medium hover:opacity-80 flex items-center gap-1", currentPhaseColors.textActive)}>
                View Pathway <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {signalPhases.map((phase) => {
                const isActive = currentDay >= phase.dayStart && currentDay <= phase.dayEnd
                const isDone = currentDay > phase.dayEnd
                const completedInPhase = isDone 
                  ? 15 
                  : isActive 
                    ? Math.max(0, currentDay - phase.dayStart)
                    : 0
                
                return (
                  <div 
                    key={phase.letter} 
                    className={cn(
                      "bg-card rounded-xl p-4 border transition-all hover:shadow-md",
                      isActive ? phase.borderActive + " shadow-sm" : "border-border"
                    )}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        className={cn(
                          "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                          isDone 
                            ? `${phase.bgDone} ${phase.textDone}` 
                            : isActive 
                              ? `${phase.bgActive} ${phase.textActive}` 
                              : "bg-slate-100 text-slate-400"
                        )}
                      >
                        {phase.letter}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className={cn(
                          "text-xs font-semibold truncate",
                          isActive ? phase.textActive : isDone ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {phase.name}
                        </h4>
                        <p className="text-[10px] text-muted-foreground">
                          {completedInPhase}/15 days
                        </p>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          isDone ? phase.progressDone : isActive ? phase.progressActive : "bg-slate-200"
                        )}
                        style={{ width: `${(completedInPhase / 15) * 100}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Column - Leadership Control Center */}
        <div className="space-y-6">
          {/* Leadership Index Card */}
          <div className="control-panel rounded-2xl p-6 border border-border">
            <div className="flex items-center gap-4 mb-6">
              <div className={cn("h-14 w-14 rounded-full flex items-center justify-center text-white text-xl font-bold", currentPhaseColors.bgDone)}>
                {firstName[0]?.toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-foreground tracking-tight">{profile?.full_name || firstName}</h3>
                <p className="text-sm text-muted-foreground">
                  {profile?.title || "Executive Leader"}
                </p>
              </div>
            </div>
            
            {/* Leadership Index */}
            <div className="grid grid-cols-3 gap-3">
              <div className={cn("text-center p-3 rounded-xl", currentPhaseColors.bgActive)}>
                <div className={cn("flex items-center justify-center gap-1 font-bold text-lg", currentPhaseColors.textActive)}>
                  <Flame className="h-4 w-4" />
                  {streak}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Streak</p>
              </div>
              <div className={cn("text-center p-3 rounded-xl", currentPhaseColors.bgActive)}>
                <div className={cn("flex items-center justify-center gap-1 font-bold text-lg", currentPhaseColors.textActive)}>
                  <TrendingUp className="h-4 w-4" />
                  {totalPoints}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Leadership Index</p>
              </div>
              <div className={cn("text-center p-3 rounded-xl", currentPhaseColors.bgActive)}>
                <div className={cn("flex items-center justify-center gap-1 font-bold text-lg", currentPhaseColors.textActive)}>
                  <Trophy className="h-4 w-4" />
                  {completedDays}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Applied</p>
              </div>
            </div>
          </div>

          {/* Next Milestone Card */}
          <div className="control-panel rounded-2xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className={cn("p-2.5 rounded-xl", currentPhaseColors.bgActive)}>
                <Target className={cn("h-5 w-5", currentPhaseColors.textActive)} />
              </div>
              <h3 className="font-bold text-foreground tracking-tight">Next Milestone</h3>
            </div>
            <div className={cn("p-4 rounded-xl mb-4", currentPhaseColors.bgActive)}>
              <p className={cn("text-sm font-semibold mb-1", currentPhaseColors.textActive)}>
                {getNextMilestone(currentDay, currentPhaseColors.name)}
              </p>
              <p className="text-xs text-muted-foreground">
                {getMilestoneDaysRemaining(currentDay)} days remaining
              </p>
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground italic">
                &ldquo;Consistency = Compound Clarity&rdquo;
              </p>
            </div>
          </div>

          {/* Weekly Performance */}
          <div className="control-panel rounded-2xl p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground tracking-tight">Weekly Performance</h3>
              <span className="text-xs text-muted-foreground">
                {today.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
              </span>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day, i) => (
                <div key={i} className="text-center">
                  <span className="text-xs text-muted-foreground block mb-2">{day.day}</span>
                  <div 
                    className={cn(
                      "w-9 h-9 mx-auto rounded-full flex items-center justify-center text-sm font-medium transition-all",
                      day.isToday 
                        ? cn(currentPhaseColors.bgDone, "text-white")
                        : day.isPast && i < streak
                          ? cn(currentPhaseColors.bgActive, currentPhaseColors.textActive)
                          : "bg-slate-100 text-muted-foreground"
                    )}
                  >
                    {day.date}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trajectory Overview */}
          <div className="control-panel rounded-2xl p-6 border border-border">
            <h3 className="font-bold text-foreground mb-4 tracking-tight">Trajectory Overview</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Program Completion</span>
                  <span className="font-semibold text-foreground">{progressPercentage}%</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden progress-bar-executive">
                  <div 
                    className={cn("h-full rounded-full transition-all", currentPhaseColors.progressDone)}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Phase Progress</span>
                  <span className={cn("font-semibold", currentPhaseColors.textActive)}>
                    {currentPhaseColors.name}
                  </span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden progress-bar-executive">
                  <div 
                    className={cn("h-full rounded-full transition-all", currentPhaseColors.progressActive)}
                    style={{ width: `${((currentDay - currentPhaseColors.dayStart) / 15) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Next Office Hours */}
          {nextOfficeHours && (
            <div className="control-panel rounded-2xl p-6 border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className={cn("p-2.5 rounded-xl bg-signal-n-light")}>
                  <Video className="h-5 w-5 text-signal-n" />
                </div>
                <h3 className="font-bold text-foreground tracking-tight">Next Office Hours</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-foreground">{nextOfficeHours.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(nextOfficeHours.scheduled_at).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit"
                    })}
                  </p>
                </div>
                {nextOfficeHours.description && (
                  <p className="text-xs text-muted-foreground">{nextOfficeHours.description}</p>
                )}
                {nextOfficeHours.meeting_url && (
                  <a
                    href={nextOfficeHours.meeting_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full btn-executive text-white py-2.5 rounded-xl font-semibold text-sm mt-2"
                  >
                    Join Meeting
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Leadership Momentum */}
          <div className="btn-executive rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Star className="h-5 w-5" />
              </div>
              <h3 className="font-bold tracking-tight">Momentum Building</h3>
            </div>
            <p className="text-sm opacity-90 mb-4">
              {7 - streak > 0 
                ? `${7 - streak} more days to unlock your weekly leadership badge.`
                : "Weekly leadership badge unlocked! Keep the momentum."}
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2.5 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${Math.min((streak / 7) * 100, 100)}%` }}
                />
              </div>
              <span className="text-sm font-semibold">{Math.min(streak, 7)}/7</span>
            </div>
          </div>
        </div>
      </div>
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

function getNextMilestone(currentDay: number, currentPhaseName: string) {
  const phaseEndDays = [15, 30, 45, 60, 75, 90]
  const phaseNames = ["Self-Awareness", "Interpretation", "Goals & Strategy", "Navigation", "Action & Execution", "Leadership Identity"]
  
  for (let i = 0; i < phaseEndDays.length; i++) {
    if (currentDay <= phaseEndDays[i]) {
      return `Unlock ${phaseNames[i]} Mastery`
    }
  }
  return "Complete Leadership Transformation"
}

function getMilestoneDaysRemaining(currentDay: number) {
  const phaseEndDays = [15, 30, 45, 60, 75, 90]
  for (const endDay of phaseEndDays) {
    if (currentDay <= endDay) {
      return endDay - currentDay + 1
    }
  }
  return 0
}
