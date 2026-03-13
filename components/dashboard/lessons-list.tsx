"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  CheckCircle2, 
  Lock, 
  Play,
  ArrowRight,
  Sparkles,
  Flame,
  TrendingUp,
  Target
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { MarkdownContent } from "@/components/ui/markdown-content"

interface Lesson {
  id: string
  day_number: number
  // Phase info
  phase: string
  phase_name: string
  phase_subtitle: string | null
  phase_goal: string | null
  // Focus
  focus_area: string | null
  focus_reframe_technique: string | null
  // Content
  leader_example: string | null
  mental_model: string | null
  ai_leadership_lens: string | null
  // Actions
  action_for_today: string | null
  action_for_today1: string | null
  action_for_today2: string | null
  // Legacy
  insight_quote?: string | null
}

interface LessonProgress {
  day_number: number
  completed: boolean
}

interface LessonsListProps {
  lessons: Lesson[]
  progress: LessonProgress[]
}

const phases = [
  { letter: "S", name: "Self-Awareness", range: [1, 15], color: "bg-signal-s", light: "bg-signal-s-light", text: "text-signal-s", border: "border-signal-s" },
  { letter: "I", name: "Interpretation", range: [16, 30], color: "bg-signal-i", light: "bg-signal-i-light", text: "text-signal-i", border: "border-signal-i" },
  { letter: "G", name: "Goals & Strategy", range: [31, 45], color: "bg-signal-g", light: "bg-signal-g-light", text: "text-signal-g", border: "border-signal-g" },
  { letter: "N", name: "Navigation", range: [46, 60], color: "bg-signal-n", light: "bg-signal-n-light", text: "text-signal-n", border: "border-signal-n" },
  { letter: "A", name: "Action & Execution", range: [61, 75], color: "bg-signal-a", light: "bg-signal-a-light", text: "text-signal-a", border: "border-signal-a" },
  { letter: "L", name: "Leadership Identity", range: [76, 90], color: "bg-signal-l", light: "bg-signal-l-light", text: "text-signal-l", border: "border-signal-l" },
]

// Sample quotes for demonstration - in production, these would come from the lesson data
const getInsightQuote = (day: number): string => {
  const quotes: Record<number, string> = {
    1: "The first step to leading others is understanding yourself.",
    2: "Resistance protects something important.",
    3: "Your triggers reveal your values.",
    4: "Clarity precedes mastery.",
    5: "Growth happens at the edge of comfort.",
    6: "Leadership is a practice, not a position.",
    7: "Your patterns are your teachers.",
    8: "The obstacle is the way forward.",
    9: "Influence begins with inquiry.",
    10: "What you focus on expands.",
  }
  return quotes[day] || "Leadership insight awaits."
}

export function LessonsList({ lessons, progress }: LessonsListProps) {
  const [search, setSearch] = useState("")
  const [activePhase, setActivePhase] = useState<string | null>(null)

  const completedDays = new Set(progress.filter(p => p.completed).map(p => p.day_number))
  const currentDay = completedDays.size > 0 ? Math.min(Math.max(...completedDays) + 1, 90) : 1
  const currentPhase = phases.find(p => currentDay >= p.range[0] && currentDay <= p.range[1])
  
  // Calculate streak (consecutive days completed)
  const streak = useMemo(() => {
    let count = 0
    for (let i = currentDay - 1; i >= 1; i--) {
      if (completedDays.has(i)) count++
      else break
    }
    return count
  }, [completedDays, currentDay])

  const filteredLessons = useMemo(() => {
    return lessons.filter(lesson => {
      const matchesSearch = !search || 
        lesson.focus_reframe_technique?.toLowerCase().includes(search.toLowerCase()) ||
        lesson.leader_example?.toLowerCase().includes(search.toLowerCase()) ||
        lesson.day_number.toString().includes(search)
      
      const matchesPhase = !activePhase || 
        phases.find(p => p.letter === activePhase && lesson.day_number >= p.range[0] && lesson.day_number <= p.range[1])
      
      return matchesSearch && matchesPhase
    })
  }, [lessons, search, activePhase])

  const getPhaseForDay = (day: number) => phases.find(p => day >= p.range[0] && day <= p.range[1])
  const currentLesson = lessons.find(l => l.day_number === currentDay)
  
  // Phase progress calculations
  const phaseProgress = useMemo(() => {
    return phases.map(phase => {
      const completed = Array.from({ length: 15 }, (_, i) => phase.range[0] + i).filter(d => completedDays.has(d)).length
      return { ...phase, completed, total: 15, percentage: Math.round((completed / 15) * 100) }
    })
  }, [completedDays])

  // Find next unlock
  const nextUnlock = useMemo(() => {
    const nextPhase = phases.find(p => currentDay < p.range[0])
    return nextPhase ? { phase: nextPhase, daysAway: nextPhase.range[0] - currentDay } : null
  }, [currentDay])

  return (
    <div className="space-y-4">
      {/* Command Center Header - Hero Strip */}
      {currentLesson && !search && !activePhase && (
        <Card className={cn(
          "overflow-hidden border-0 shadow-lg",
          "bg-gradient-to-br from-signal-s/10 via-background to-signal-n/5"
        )}>
          <CardContent className="p-0">
            <div className="flex flex-col lg:flex-row">
              {/* Main CTA Section */}
              <div className="flex-1 p-5 lg:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    {/* Phase indicator */}
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center font-bold text-sm text-white",
                        currentPhase?.color
                      )}>
                        {currentPhase?.letter}
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                          Phase {currentLesson.phase || phases.indexOf(currentPhase!) + 1} of 6
                        </p>
                        <p className={cn("text-xs font-semibold", currentPhase?.text)}>
                          {currentLesson.phase_name || currentPhase?.name}
                        </p>
                      </div>
                      {streak > 0 && (
                        <Badge variant="secondary" className="ml-2 gap-1 bg-amber-100 text-amber-700 border-amber-200">
                          <Flame className="h-3 w-3" />
                          {streak} day streak
                        </Badge>
                      )}
                    </div>

                    {/* Day title */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Continue Day {currentDay}</p>
                      <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-balance">
                        <MarkdownContent content={currentLesson.focus_reframe_technique || `Framework ${currentDay}`} inline />
                      </h2>
                    </div>

                    {/* Mental model preview */}
                    {currentLesson.mental_model && (
                      <p className="text-sm text-muted-foreground max-w-md line-clamp-2">
                        <MarkdownContent content={currentLesson.mental_model} inline />
                      </p>
                    )}

                    {/* Phase goal and action count */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {currentLesson.phase_goal && (
                        <span className="line-clamp-1 flex-1">{currentLesson.phase_goal}</span>
                      )}
                      <span className="flex items-center gap-1 flex-shrink-0">
                        <Target className="h-3 w-3" />
                        {[currentLesson.action_for_today, currentLesson.action_for_today1, currentLesson.action_for_today2].filter(Boolean).length} actions
                      </span>
                    </div>
                  </div>

                  {/* CTA */}
                  <Link href={`/dashboard/lessons/${currentDay}`} className="flex-shrink-0">
                    <Button size="lg" className="btn-executive gap-2 h-11 px-6 shadow-lg">
                      <Play className="h-4 w-4" />
                      Continue
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Progress Sidebar */}
              <div className="lg:w-72 p-5 lg:p-6 bg-muted/30 border-t lg:border-t-0 lg:border-l border-border/50">
                <div className="space-y-4">
                  {/* Overall progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground">Overall Progress</span>
                      <span className="text-sm font-bold">{completedDays.size}/90</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-signal-s to-signal-n rounded-full transition-all duration-500"
                        style={{ width: `${(completedDays.size / 90) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Current phase progress */}
                  {currentPhase && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground">{currentPhase.name}</span>
                        <span className={cn("text-sm font-bold", currentPhase.text)}>
                          {phaseProgress.find(p => p.letter === currentPhase.letter)?.completed}/15
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full rounded-full transition-all duration-500", currentPhase.color)}
                          style={{ width: `${((phaseProgress.find(p => p.letter === currentPhase.letter)?.completed || 0) / 15) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Next unlock */}
                  {nextUnlock && (
                    <div className="pt-2 border-t border-border/50">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Next Unlock</p>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "h-5 w-5 rounded flex items-center justify-center text-[10px] font-bold",
                          nextUnlock.phase.light, nextUnlock.phase.text
                        )}>
                          {nextUnlock.phase.letter}
                        </div>
                        <span className="text-xs font-medium">{nextUnlock.phase.name}</span>
                        <Badge variant="outline" className="ml-auto text-[10px] h-5">
                          {nextUnlock.daysAway} days
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Title + Stats */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-lg font-bold tracking-tight">All Frameworks</h1>
            <p className="text-xs text-muted-foreground">
              {completedDays.size} completed · {90 - completedDays.size} remaining
            </p>
          </div>
        </div>
        
        {/* Right: Search */}
        <div className="relative w-full sm:w-56">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input 
            placeholder="Search frameworks..." 
            className="pl-8 h-8 text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Phase Tabs - Enhanced with progress indicators */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        <button
          onClick={() => setActivePhase(null)}
          className={cn(
            "flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
            !activePhase 
              ? "bg-foreground text-background shadow-sm" 
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          All
          <span className="ml-1.5 opacity-60">{completedDays.size}</span>
        </button>
        {phaseProgress.map(phase => {
          const isActive = activePhase === phase.letter
          const isCurrentPhase = currentPhase?.letter === phase.letter
          return (
            <button
              key={phase.letter}
              onClick={() => setActivePhase(isActive ? null : phase.letter)}
              className={cn(
                "flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
                isActive && cn(phase.color, "text-white shadow-sm"),
                !isActive && isCurrentPhase && cn(phase.light, phase.text),
                !isActive && !isCurrentPhase && "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span className={cn(
                "w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold transition-colors",
                isActive ? "bg-white/20 text-white" : cn(phase.light, phase.text)
              )}>
                {phase.letter}
              </span>
              <span className="hidden md:inline">{phase.name}</span>
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded",
                isActive ? "bg-white/20" : "bg-muted",
                phase.completed === 15 && !isActive && "bg-green-100 text-green-700"
              )}>
                {phase.completed}/{phase.total}
              </span>
            </button>
          )
        })}
      </div>

      {/* AI Recommendation Banner */}
      {!search && !activePhase && currentDay <= 90 && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-signal-s/5 to-signal-i/5 border border-signal-s/10">
          <div className="h-8 w-8 rounded-lg bg-signal-s/10 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-4 w-4 text-signal-s" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium">Recommended Next</p>
            <p className="text-[11px] text-muted-foreground truncate">
              Day {currentDay}: <MarkdownContent content={currentLesson?.focus_reframe_technique || `Framework ${currentDay}`} inline /> — Build on your momentum
            </p>
          </div>
          <Link href={`/dashboard/lessons/${currentDay}`}>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-signal-s hover:text-signal-s hover:bg-signal-s/10">
              Start <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      )}

      {/* Grid of Framework Tiles - Tighter spacing, increased density */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 stagger-children">
        {filteredLessons.map(lesson => {
          const phase = getPhaseForDay(lesson.day_number)
          const isCompleted = completedDays.has(lesson.day_number)
          const isCurrent = lesson.day_number === currentDay
          const isLocked = lesson.day_number > currentDay

          return (
            <Link
              key={lesson.id}
              href={isLocked ? "#" : `/dashboard/lessons/${lesson.day_number}`}
              onClick={(e) => isLocked && e.preventDefault()}
              className={cn(
                "group relative rounded-lg border transition-all duration-200",
                // Active / Current tile - glow effect
                isCurrent && cn(
                  "bg-gradient-to-br from-background to-signal-s/5",
                  "border-signal-s/40 shadow-md",
                  "ring-2 ring-signal-s/20"
                ),
                // Completed tiles - full color, subtle elevation
                isCompleted && !isCurrent && cn(
                  "bg-muted/30 border-transparent",
                  "hover:bg-muted/50 hover:shadow-sm"
                ),
                // Available but not started
                !isCompleted && !isCurrent && !isLocked && cn(
                  "bg-background border-border/50",
                  "hover:border-muted-foreground/30 hover:shadow-sm hover:bg-muted/20"
                ),
                // Locked tiles - greyed, reduced opacity
                isLocked && cn(
                  "bg-muted/20 border-transparent",
                  "opacity-50 cursor-not-allowed"
                )
              )}
            >
              {/* Content - reduced padding for density */}
              <div className="p-3">
                {/* Top row: Day number + Phase + Status */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    {/* Day indicator with state-based styling */}
                    <div className={cn(
                      "h-6 w-6 rounded flex items-center justify-center text-[10px] font-bold transition-colors",
                      isCompleted && cn(phase?.color, "text-white"),
                      isCurrent && cn(phase?.light, phase?.text),
                      !isCompleted && !isCurrent && !isLocked && "bg-muted text-muted-foreground",
                      isLocked && "bg-muted/50 text-muted-foreground/50"
                    )}>
                      {isCompleted ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : isLocked ? (
                        <Lock className="h-3 w-3" />
                      ) : (
                        lesson.day_number
                      )}
                    </div>
                    <span className={cn(
                      "text-[10px] font-medium",
                      isLocked ? "text-muted-foreground/50" : "text-muted-foreground"
                    )}>
                      Day {lesson.day_number}
                    </span>
                  </div>
                  
                  {/* Status badges */}
                  <div className="flex items-center gap-1">
                    {isCurrent && (
                      <Badge className="h-4 text-[9px] px-1.5 bg-signal-s text-white border-0 animate-pulse-glow">
                        NOW
                      </Badge>
                    )}
                    {!isCurrent && !isLocked && (
                      <div className={cn(
                        "h-4 w-4 rounded flex items-center justify-center text-[9px] font-bold",
                        phase?.light, phase?.text
                      )}>
                        {phase?.letter}
                      </div>
                    )}
                  </div>
                </div>

                {/* Framework title */}
                <h3 className={cn(
                  "font-semibold text-xs leading-snug line-clamp-2 min-h-[2rem] mb-1.5",
                  isLocked && "text-muted-foreground/60",
                  isCurrent && "text-foreground",
                  isCompleted && !isCurrent && "text-foreground",
                  !isCompleted && !isCurrent && !isLocked && "text-foreground group-hover:text-signal-s transition-colors"
                )}>
                  <MarkdownContent content={lesson.focus_reframe_technique || `Framework ${lesson.day_number}`} inline />
                </h3>

                {/* Mental model preview - only show for active/unlocked */}
                {!isLocked && lesson.mental_model && (
                  <p className={cn(
                    "text-[10px] mb-1.5 line-clamp-1",
                    isCompleted || isCurrent ? "text-muted-foreground" : "text-muted-foreground/70"
                  )}>
                    <MarkdownContent content={lesson.mental_model} inline />
                  </p>
                )}

                {/* Action count indicator */}
                {!isLocked && (
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <Target className="h-3 w-3" />
                    <span>
                      {[lesson.action_for_today, lesson.action_for_today1, lesson.action_for_today2].filter(Boolean).length} actions
                    </span>
                    {lesson.ai_leadership_lens && (
                      <>
                        <span className="text-muted-foreground/50">·</span>
                        <span className="text-blue-500">AI Lens</span>
                      </>
                    )}
                  </div>
                )}

                {/* Progress micro-bar for current */}
                {isCurrent && (
                  <div className="mt-2 pt-2 border-t border-signal-s/20">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="h-3 w-3 text-signal-s" />
                      <span className="text-[9px] text-signal-s font-medium">In Progress</span>
                    </div>
                  </div>
                )}

                {/* Completed indicator */}
                {isCompleted && !isCurrent && (
                  <div className="mt-2 pt-2 border-t border-border/50">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className={cn("h-3 w-3", phase?.text)} />
                      <span className={cn("text-[9px] font-medium", phase?.text)}>Completed</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Hover arrow for available tiles */}
              {!isLocked && !isCurrent && (
                <ArrowRight className="absolute bottom-2.5 right-2.5 h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              )}

              {/* Accent border for current */}
              {isCurrent && (
                <div className={cn(
                  "absolute left-0 top-0 bottom-0 w-1 rounded-l-lg",
                  phase?.color
                )} />
              )}
            </Link>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredLessons.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium">No frameworks found</p>
          <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters</p>
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-3 text-xs" 
            onClick={() => { setSearch(""); setActivePhase(null) }}
          >
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  )
}
