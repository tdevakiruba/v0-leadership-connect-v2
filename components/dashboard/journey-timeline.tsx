"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  CheckCircle2, 
  Lock,
  Calendar,
  Target,
  Trophy,
  Star,
  ArrowRight,
  Play,
  TrendingUp
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface Lesson {
  id: string
  day_number: number
  phase: string
  phase_name: string
  phase_goal: string | null
  focus_area: string | null
  focus_reframe_technique: string | null
  mental_model: string | null
}

interface JourneyProgress {
  day_number: number
  completed: boolean
  completed_at: string | null
  points_awarded: number
}

interface JourneyTimelineProps {
  lessons: Lesson[]
  progress: JourneyProgress[]
}

// SIGNAL phases with gradient colors
const phases = [
  { letter: "S", name: "Self-Awareness", range: [1, 15], color: "signal-s" },
  { letter: "I", name: "Interpretation", range: [16, 30], color: "signal-i" },
  { letter: "G", name: "Goals & Strategy", range: [31, 45], color: "signal-g" },
  { letter: "N", name: "Navigation", range: [46, 60], color: "signal-n" },
  { letter: "A", name: "Action & Execution", range: [61, 75], color: "signal-a" },
  { letter: "L", name: "Leadership Identity", range: [76, 90], color: "signal-l" },
]

export function JourneyTimeline({ lessons, progress }: JourneyTimelineProps) {
  const [expandedPhase, setExpandedPhase] = useState<number | null>(null)

  const completedDays = new Set(progress.filter(p => p.completed).map(p => p.day_number))
  const currentDay = completedDays.size > 0 
    ? Math.min(Math.max(...completedDays) + 1, 90)
    : 1

  const currentPhaseIndex = phases.findIndex(
    phase => currentDay >= phase.range[0] && currentDay <= phase.range[1]
  )
  const totalPoints = progress.reduce((sum, p) => sum + (p.points_awarded || 0), 0)
  const overallProgress = Math.round((completedDays.size / 90) * 100)

  const getPhaseStats = (phaseIndex: number) => {
    const phase = phases[phaseIndex]
    const phaseDays = Array.from(
      { length: phase.range[1] - phase.range[0] + 1 }, 
      (_, i) => phase.range[0] + i
    )
    const completed = phaseDays.filter(day => completedDays.has(day)).length
    return { completed, total: phaseDays.length, progress: Math.round((completed / phaseDays.length) * 100) }
  }

  return (
    <div className="space-y-6">
      {/* Compact Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leadership Pathway</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Day {currentDay} of 90</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-signal-s-light flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-signal-s" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Index</p>
              <p className="font-bold">{totalPoints}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-signal-g-light flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-signal-g" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Applied</p>
              <p className="font-bold">{completedDays.size}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Progress Visualization */}
      <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-slate-50 to-white">
        <CardContent className="p-6 sm:p-8">
          {/* Overall Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm font-bold text-signal-s">{overallProgress}%</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-signal-s via-signal-g to-signal-l rounded-full transition-all duration-700 ease-out"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>

          {/* Horizontal Timeline */}
          <div className="relative">
            {/* Connection Line */}
            <div className="absolute top-6 left-6 right-6 h-0.5 bg-slate-200" />
            <div 
              className="absolute top-6 left-6 h-0.5 bg-gradient-to-r from-signal-s via-signal-g to-signal-n transition-all duration-700"
              style={{ width: `${Math.min(overallProgress, 100) * 0.9}%` }}
            />

            {/* Phase Nodes */}
            <div className="relative flex justify-between">
              {phases.map((phase, index) => {
                const stats = getPhaseStats(index)
                const isActive = currentPhaseIndex === index
                const isComplete = stats.progress === 100
                const isPast = currentPhaseIndex > index
                const isFuture = currentPhaseIndex < index

                return (
                  <div 
                    key={phase.letter}
                    className="flex flex-col items-center"
                  >
                    {/* Phase Circle */}
                    <button
                      onClick={() => setExpandedPhase(expandedPhase === index ? null : index)}
                      className={cn(
                        "relative z-10 h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300",
                        isComplete && `bg-${phase.color} text-white shadow-lg`,
                        isActive && !isComplete && `bg-${phase.color} text-white ring-4 ring-${phase.color}/30 shadow-lg`,
                        isPast && !isComplete && `bg-${phase.color}/80 text-white`,
                        isFuture && "bg-slate-100 text-slate-400",
                        "hover:scale-110"
                      )}
                    >
                      {isComplete ? <CheckCircle2 className="h-6 w-6" /> : phase.letter}
                    </button>

                    {/* Phase Label */}
                    <div className="mt-3 text-center">
                      <p className={cn(
                        "text-xs font-semibold",
                        isActive ? `text-${phase.color}` : "text-muted-foreground"
                      )}>
                        {phase.letter}
                      </p>
                      <p className="text-[10px] text-muted-foreground hidden sm:block">
                        {stats.completed}/{stats.total}
                      </p>
                    </div>

                    {/* Active Indicator */}
                    {isActive && (
                      <div className={`mt-1 h-1 w-6 rounded-full bg-${phase.color}`} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Expanded Phase Detail */}
          {expandedPhase !== null && (
            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg">{phases[expandedPhase].name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Days {phases[expandedPhase].range[0]}-{phases[expandedPhase].range[1]}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full bg-${phases[expandedPhase].color}-light text-${phases[expandedPhase].color} text-sm font-semibold`}>
                  {getPhaseStats(expandedPhase).progress}% Complete
                </div>
              </div>

              {/* Compact Day Grid */}
              <div className="flex flex-wrap gap-1.5">
                {Array.from(
                  { length: phases[expandedPhase].range[1] - phases[expandedPhase].range[0] + 1 },
                  (_, i) => phases[expandedPhase].range[0] + i
                ).map(day => {
                  const isCompleted = completedDays.has(day)
                  const isCurrent = day === currentDay
                  const isLocked = day > currentDay

                  return (
                    <Link
                      key={day}
                      href={isLocked ? "#" : `/dashboard/lessons/${day}`}
                      onClick={(e) => isLocked && e.preventDefault()}
                      className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all",
                        isCompleted && `bg-${phases[expandedPhase].color} text-white`,
                        isCurrent && `bg-${phases[expandedPhase].color} text-white ring-2 ring-offset-1 ring-${phases[expandedPhase].color}`,
                        !isCompleted && !isCurrent && !isLocked && `bg-${phases[expandedPhase].color}-light text-${phases[expandedPhase].color} hover:opacity-80`,
                        isLocked && "bg-slate-50 text-slate-300 cursor-not-allowed"
                      )}
                    >
                      {day}
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Current Day CTA */}
          <div className="mt-8 p-5 rounded-2xl bg-gradient-to-r from-signal-s/10 via-signal-g/10 to-signal-n/10 border border-signal-s/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl bg-${phases[currentPhaseIndex]?.color || 'signal-s'} flex items-center justify-center`}>
                  <Play className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Continue Your Journey</p>
                  <h4 className="font-bold">
                    Day {currentDay}: {lessons.find(l => l.day_number === currentDay)?.focus_reframe_technique || phases[currentPhaseIndex]?.name}
                  </h4>
                </div>
              </div>
              <Link href={`/dashboard/lessons/${currentDay}`}>
                <Button className="btn-executive text-white rounded-xl px-6">
                  Start Day {currentDay}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compact Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Star, label: "Leadership Index", value: totalPoints, color: "signal-s" },
          { icon: CheckCircle2, label: "Frameworks Applied", value: completedDays.size, color: "signal-i" },
          { icon: Target, label: "Phases Mastered", value: currentPhaseIndex >= 0 ? currentPhaseIndex : 0, color: "signal-g" },
          { icon: Calendar, label: "Days Remaining", value: 90 - completedDays.size, color: "signal-n" },
        ].map((stat, i) => (
          <div 
            key={i}
            className={`flex items-center gap-3 p-4 rounded-xl bg-${stat.color}-light/50 border border-${stat.color}/10`}
          >
            <stat.icon className={`h-5 w-5 text-${stat.color}`} />
            <div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="font-bold text-lg">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
