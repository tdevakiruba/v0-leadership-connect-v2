"use client"

import { useState } from "react"
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
  TrendingUp
} from "lucide-react"
import Link from "next/link"

// SIGNAL™ phase color configurations
const signalPhases = [
  {
    letter: "S",
    name: "Self-Awareness",
    dayStart: 1,
    dayEnd: 15,
    bgActive: "bg-blue-100",
    textActive: "text-blue-600",
    bgDone: "bg-blue-600",
    textDone: "text-white",
    progressActive: "bg-blue-500",
    progressDone: "bg-blue-600",
  },
  {
    letter: "I",
    name: "Interpretation",
    dayStart: 16,
    dayEnd: 30,
    bgActive: "bg-indigo-100",
    textActive: "text-indigo-600",
    bgDone: "bg-indigo-600",
    textDone: "text-white",
    progressActive: "bg-indigo-500",
    progressDone: "bg-indigo-600",
  },
  {
    letter: "G",
    name: "Goals & Strategy",
    dayStart: 31,
    dayEnd: 45,
    bgActive: "bg-violet-100",
    textActive: "text-violet-600",
    bgDone: "bg-violet-600",
    textDone: "text-white",
    progressActive: "bg-violet-500",
    progressDone: "bg-violet-600",
  },
  {
    letter: "N",
    name: "Navigation",
    dayStart: 46,
    dayEnd: 60,
    bgActive: "bg-cyan-100",
    textActive: "text-cyan-600",
    bgDone: "bg-cyan-600",
    textDone: "text-white",
    progressActive: "bg-cyan-500",
    progressDone: "bg-cyan-600",
  },
  {
    letter: "A",
    name: "Action & Execution",
    dayStart: 61,
    dayEnd: 75,
    bgActive: "bg-teal-100",
    textActive: "text-teal-600",
    bgDone: "bg-teal-600",
    textDone: "text-white",
    progressActive: "bg-teal-500",
    progressDone: "bg-teal-600",
  },
  {
    letter: "L",
    name: "Leadership Identity",
    dayStart: 76,
    dayEnd: 90,
    bgActive: "bg-sky-100",
    textActive: "text-sky-600",
    bgDone: "bg-sky-600",
    textDone: "text-white",
    progressActive: "bg-sky-500",
    progressDone: "bg-sky-600",
  },
]

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
  const currentPhaseColors = signalPhases.find(
    p => currentDay >= p.dayStart && currentDay <= p.dayEnd
  ) || signalPhases[0]
  
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
              <Link href="/dashboard/lessons" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            
            {todayLesson && (
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Current Lesson Card */}
                <div className="bg-card rounded-2xl p-5 border border-border hover:border-blue-200 hover:shadow-lg transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2.5 bg-blue-100 rounded-xl">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
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
                      <span className="text-blue-600 font-medium">{progressPercentage}%</span>
                    </div>
                    <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                  <Link 
                    href={`/dashboard/lessons/${currentDay}`}
                    className="flex items-center gap-2 text-blue-600 text-sm font-medium group-hover:gap-3 transition-all"
                  >
                    {isCompleted ? "Review Lesson" : "Resume Lesson"} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                {/* Next Lesson Preview */}
                <div className="bg-card rounded-2xl p-5 border border-border hover:border-blue-200 hover:shadow-lg transition-all group">
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
                        ? "text-blue-600 group-hover:gap-3" 
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

          {/* Today's Reflection Section */}
          {todayLesson && (
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Zap className="h-4 w-4 text-amber-600" />
                </div>
                <h3 className="font-semibold text-foreground">Today&apos;s Reflection</h3>
              </div>
              
              {todayLesson.thought_to_work_on && (
                <div className="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-100">
                  <p className="text-sm text-blue-800 leading-relaxed">
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
                  "focus:border-blue-300 focus:ring-2 focus:ring-blue-100",
                  "transition-all duration-200"
                )}
              />
              
              <div className="mt-4 flex items-center justify-between">
                {!isCompleted ? (
                  <Button 
                    onClick={handleComplete} 
                    disabled={isSubmitting || !reflection.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2 h-auto font-medium shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Saving..." : "Complete Day"}
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 text-emerald-600 font-medium">
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
              <Link href="/dashboard/journey" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                Details <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {signalPhases.map((phase, i) => {
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
                      isActive ? "border-blue-200 shadow-sm" : "border-border"
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
              <div className="h-14 w-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-semibold">
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
              <div className="text-center p-3 bg-blue-50 rounded-xl">
                <div className="flex items-center justify-center gap-1 text-blue-600 font-bold text-lg">
                  <Flame className="h-4 w-4" />
                  {streak}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Day Streak</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-xl">
                <div className="flex items-center justify-center gap-1 text-blue-600 font-bold text-lg">
                  <Sparkles className="h-4 w-4" />
                  {totalPoints}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Points</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-xl">
                <div className="flex items-center justify-center gap-1 text-blue-600 font-bold text-lg">
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
                        ? "bg-blue-600 text-white" 
                        : day.isPast && i < streak
                          ? "bg-blue-100 text-blue-600"
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
                    className="h-full bg-blue-600 rounded-full transition-all"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Current Phase</span>
                  <span className={cn("font-medium", currentPhaseColors?.textActive || "text-foreground")}>
                    {currentPhaseColors?.name || currentPhase?.name}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all",
                      currentPhaseColors?.progressActive || "bg-blue-500"
                    )}
                    style={{ width: `${((currentDay - (currentPhaseColors?.dayStart || 1)) / 15) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Achievement Teaser */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Star className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">Keep Going!</h3>
            </div>
            <p className="text-sm text-blue-100 mb-4">
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
