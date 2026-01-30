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
  Loader2,
  Square,
  CheckSquare
} from "lucide-react"
import Link from "next/link"
import { generateBoldActions, toggleActionCompleted, saveActionsToProgress } from "@/app/actions/ai-actions"

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
    actions_completed?: number[]
    ai_actions?: ActionItem[]
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
          {/* Welcome Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                Welcome back, {firstName}!
              </h1>
              <p className="text-muted-foreground mt-1">
                Continue your leadership journey. You&apos;re doing great!
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </div>
          </div>

          {/* Continue Learning Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Continue Learning</h2>
              <Link href="/dashboard/lessons" className={cn("text-sm hover:opacity-80 flex items-center gap-1", currentPhaseColors.textActive)}>
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            
            {todayLesson && (
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Current Lesson Card */}
                <div className={cn("bg-card rounded-2xl p-5 border hover:shadow-lg transition-all group", currentPhaseColors.borderActive)}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn("p-2.5 rounded-xl", currentPhaseColors.bgActive)}>
                      <BookOpen className={cn("h-5 w-5", currentPhaseColors.textActive)} />
                    </div>
                    <span className={cn("px-2.5 py-1 text-xs font-medium rounded-full", currentPhaseColors.bgActive, currentPhaseColors.textActive)}>
                      Day {currentDay}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                    {todayLesson.focus_reframe_technique || todayLesson.focus_area}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 uppercase tracking-wide">
                    {todayLesson.focus_area}
                  </p>
                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">{completedDays}/90 Lessons</span>
                      <span className={cn("font-medium", currentPhaseColors.textActive)}>{progressPercentage}%</span>
                    </div>
                    <div className={cn("h-2 rounded-full overflow-hidden", currentPhaseColors.bgActive)}>
                      <div 
                        className={cn("h-full rounded-full transition-all duration-500", currentPhaseColors.progressDone)}
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                  <Link 
                    href={`/dashboard/lessons/${currentDay}`}
                    className={cn("flex items-center gap-2 text-sm font-medium group-hover:gap-3 transition-all", currentPhaseColors.textActive)}
                  >
                    {isCompleted ? "Review Lesson" : "Resume Lesson"} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                {/* Next Lesson Preview */}
                <div className="bg-card rounded-2xl p-5 border border-border hover:shadow-lg transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2.5 bg-slate-100 rounded-xl">
                      <Target className="h-5 w-5 text-slate-500" />
                    </div>
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                      Day {Math.min(currentDay + 1, 90)}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {currentPhase?.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 uppercase tracking-wide">
                    Next Session
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Clock className="h-4 w-4" />
                    <span>~10 min reading</span>
                  </div>
                  <button 
                    disabled={!isCompleted}
                    className={cn(
                      "flex items-center gap-2 text-sm font-medium transition-all",
                      isCompleted 
                        ? cn(currentPhaseColors.textActive, "group-hover:gap-3")
                        : "text-muted-foreground cursor-not-allowed"
                    )}
                  >
                    {isCompleted ? "Start Now" : "Complete current lesson first"}
                    {isCompleted && <ArrowRight className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Today's Actions Section */}
          {todayLesson && (
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", currentPhaseColors.bgActive)}>
                    <Target className={cn("h-4 w-4", currentPhaseColors.textActive)} />
                  </div>
                  <h3 className="font-semibold text-foreground">Today&apos;s Actions</h3>
                </div>
                <span className="text-sm text-muted-foreground">
                  {actionsCompletedCount}/{totalActionsCount} completed
                </span>
              </div>

              {/* Actions Progress */}
              <div className="mb-4">
                <div className={cn("h-2 rounded-full overflow-hidden bg-slate-100")}>
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

          {/* Today's Reflection Section */}
          {todayLesson && (
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-signal-s-light rounded-lg">
                  <Zap className="h-4 w-4 text-signal-s" />
                </div>
                <h3 className="font-semibold text-foreground">Today&apos;s Reflection</h3>
              </div>
              
              {todayLesson.thought_to_work_on && (
                <div className={cn("rounded-xl p-4 mb-4 border", currentPhaseColors.bgActive, currentPhaseColors.borderActive)}>
                  <p className={cn("text-sm leading-relaxed", currentPhaseColors.textActive)}>
                    <span className="font-semibold">Mindset prompt:</span> {todayLesson.thought_to_work_on}
                  </p>
                </div>
              )}
              
              <textarea
                placeholder="What insight will you carry forward today?"
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
                    className={cn(
                      "text-white rounded-full px-6 py-2 h-auto font-medium shadow-lg transition-all",
                      currentPhaseColors.bgDone,
                      "hover:opacity-90"
                    )}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Saving..." : "Complete Day"}
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 text-signal-g font-medium">
                    <CheckCircle2 className="h-5 w-5" />
                    Day completed
                  </div>
                )}
                <span className="text-sm text-muted-foreground">+10 points on completion</span>
              </div>
            </div>
          )}

          {/* SIGNAL™ Journey Progress */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Your SIGNAL&trade; Journey</h3>
              <Link href="/dashboard/journey" className={cn("text-sm hover:opacity-80 flex items-center gap-1", currentPhaseColors.textActive)}>
                Details <ArrowRight className="h-3 w-3" />
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

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* User Profile Card */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center gap-4 mb-6">
              <div className={cn("h-14 w-14 rounded-full flex items-center justify-center text-white text-xl font-semibold", currentPhaseColors.bgDone)}>
                {firstName[0]?.toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{profile?.full_name || firstName}</h3>
                <p className="text-sm text-muted-foreground">
                  {profile?.title || "Leadership Learner"}
                </p>
              </div>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className={cn("text-center p-3 rounded-xl", currentPhaseColors.bgActive)}>
                <div className={cn("flex items-center justify-center gap-1 font-bold text-lg", currentPhaseColors.textActive)}>
                  <Flame className="h-4 w-4" />
                  {streak}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Day Streak</p>
              </div>
              <div className={cn("text-center p-3 rounded-xl", currentPhaseColors.bgActive)}>
                <div className={cn("flex items-center justify-center gap-1 font-bold text-lg", currentPhaseColors.textActive)}>
                  <Sparkles className="h-4 w-4" />
                  {totalPoints}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Points</p>
              </div>
              <div className={cn("text-center p-3 rounded-xl", currentPhaseColors.bgActive)}>
                <div className={cn("flex items-center justify-center gap-1 font-bold text-lg", currentPhaseColors.textActive)}>
                  <Trophy className="h-4 w-4" />
                  {completedDays}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Completed</p>
              </div>
            </div>
          </div>

          {/* Weekly Streak Calendar */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Weekly Streak</h3>
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

          {/* Quick Stats */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h3 className="font-semibold text-foreground mb-4">Progress Overview</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Overall Progress</span>
                  <span className="font-medium text-foreground">{progressPercentage}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full transition-all", currentPhaseColors.progressDone)}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Current Phase</span>
                  <span className={cn("font-medium", currentPhaseColors.textActive)}>
                    {currentPhaseColors.name}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full transition-all", currentPhaseColors.progressActive)}
                    style={{ width: `${((currentDay - currentPhaseColors.dayStart) / 15) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Achievement Teaser */}
          <div className={cn("rounded-2xl p-6 text-white", currentPhaseColors.bgDone)}>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Star className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">Keep Going!</h3>
            </div>
            <p className="text-sm opacity-90 mb-4">
              Complete {7 - streak > 0 ? 7 - streak : 0} more days to unlock your weekly achievement badge.
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full"
                  style={{ width: `${Math.min((streak / 7) * 100, 100)}%` }}
                />
              </div>
              <span className="text-sm font-medium">{Math.min(streak, 7)}/7</span>
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
