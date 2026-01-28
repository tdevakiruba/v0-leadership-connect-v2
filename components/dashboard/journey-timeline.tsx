"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  CheckCircle2, 
  Circle, 
  Lock,
  ChevronRight,
  Calendar,
  Target,
  Trophy,
  Flame,
  Star,
  ArrowRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface Lesson {
  id: string
  day_number: number
  focus_area: string
  focus_reframe_technique: string | null
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

const phases = [
  { 
    letter: "S", 
    name: "Self-Awareness", 
    description: "Discover your authentic leadership style and blind spots",
    range: [1, 15],
    color: "signal-awareness"
  },
  { 
    letter: "I", 
    name: "Interpretation", 
    description: "Reframe challenges as opportunities for growth",
    range: [16, 30],
    color: "signal-interpretation"
  },
  { 
    letter: "G", 
    name: "Goals & Strategy", 
    description: "Align your vision with actionable strategies",
    range: [31, 45],
    color: "signal-alignment"
  },
  { 
    letter: "N", 
    name: "Navigation", 
    description: "Navigate complexity with clarity and purpose",
    range: [46, 60],
    color: "signal-execution"
  },
  { 
    letter: "A", 
    name: "Action & Execution", 
    description: "Execute with precision and adaptability",
    range: [61, 75],
    color: "signal-execution"
  },
  { 
    letter: "L", 
    name: "Leadership Identity", 
    description: "Embody your transformed leadership presence",
    range: [76, 90],
    color: "signal-identity"
  },
]

export function JourneyTimeline({ lessons, progress }: JourneyTimelineProps) {
  const [activePhase, setActivePhase] = useState(0)

  const completedDays = new Set(progress.filter(p => p.completed).map(p => p.day_number))
  const currentDay = completedDays.size > 0 
    ? Math.min(Math.max(...completedDays) + 1, 90)
    : 1

  // Determine current phase
  const currentPhaseIndex = phases.findIndex(
    phase => currentDay >= phase.range[0] && currentDay <= phase.range[1]
  )

  const totalPoints = progress.reduce((sum, p) => sum + (p.points_awarded || 0), 0)
  const overallProgress = Math.round((completedDays.size / 90) * 100)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your 90-Day Journey</h1>
          <p className="text-muted-foreground mt-1">
            Track your transformation through the SIGNAL leadership framework
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Overall Progress</p>
            <p className="text-2xl font-bold">{overallProgress}%</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Day {currentDay} of 90</span>
              <span className="font-medium">{completedDays.size} days completed</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
            <div className="flex justify-between">
              {phases.map((phase, index) => {
                const phaseStart = ((phase.range[0] - 1) / 90) * 100
                return (
                  <div 
                    key={phase.letter}
                    className="flex flex-col items-center"
                    style={{ position: 'relative', left: `${phaseStart - index * 16.67}%` }}
                  >
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      currentDay >= phase.range[0] ? `bg-${phase.color}` : "bg-muted"
                    )} />
                    <span className="text-xs text-muted-foreground mt-1 hidden sm:block">
                      {phase.letter}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SIGNAL Phases */}
      <div className="grid gap-4 lg:grid-cols-6">
        {phases.map((phase, index) => {
          const phaseDays = Array.from(
            { length: phase.range[1] - phase.range[0] + 1 }, 
            (_, i) => phase.range[0] + i
          )
          const phaseCompleted = phaseDays.filter(day => completedDays.has(day)).length
          const phaseTotal = phaseDays.length
          const phaseProgress = Math.round((phaseCompleted / phaseTotal) * 100)
          const isCurrentPhase = currentPhaseIndex === index
          const isPastPhase = currentPhaseIndex > index
          const isFuturePhase = currentPhaseIndex < index

          return (
            <Card 
              key={phase.letter}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                isCurrentPhase && "ring-2 ring-accent",
                activePhase === index && "bg-muted/50"
              )}
              onClick={() => setActivePhase(index)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full font-bold text-lg",
                    isPastPhase ? "bg-green-500 text-white" :
                    isCurrentPhase ? "bg-accent text-accent-foreground" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {isPastPhase ? <CheckCircle2 className="h-5 w-5" /> : phase.letter}
                  </div>
                  {isCurrentPhase && (
                    <Badge variant="secondary" className="text-xs">Active</Badge>
                  )}
                </div>
                <h3 className="font-semibold text-sm">{phase.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Days {phase.range[0]}-{phase.range[1]}
                </p>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{phaseCompleted}/{phaseTotal}</span>
                    <span className="font-medium">{phaseProgress}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all duration-300",
                        isPastPhase ? "bg-green-500" :
                        isCurrentPhase ? "bg-accent" : "bg-primary"
                      )}
                      style={{ width: `${phaseProgress}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Phase Detail */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-2xl font-bold text-primary">
                {phases[activePhase].letter}
              </div>
              <div>
                <CardTitle>{phases[activePhase].name}</CardTitle>
                <CardDescription className="mt-1">
                  {phases[activePhase].description}
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="hidden sm:flex">
              Days {phases[activePhase].range[0]}-{phases[activePhase].range[1]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Days Grid */}
          <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-15 gap-2">
            {Array.from(
              { length: phases[activePhase].range[1] - phases[activePhase].range[0] + 1 },
              (_, i) => phases[activePhase].range[0] + i
            ).map(day => {
              const lesson = lessons.find(l => l.day_number === day)
              const isCompleted = completedDays.has(day)
              const isCurrent = day === currentDay
              const isLocked = day > currentDay

              return (
                <Link
                  key={day}
                  href={isLocked ? "#" : `/dashboard/lessons/${day}`}
                  className={cn(
                    "aspect-square flex flex-col items-center justify-center rounded-lg text-sm font-medium transition-all",
                    isCompleted && "bg-green-500 text-white",
                    isCurrent && "bg-accent text-accent-foreground ring-2 ring-accent ring-offset-2",
                    !isCompleted && !isCurrent && !isLocked && "bg-muted hover:bg-muted/80",
                    isLocked && "bg-muted/50 text-muted-foreground cursor-not-allowed"
                  )}
                  onClick={(e) => isLocked && e.preventDefault()}
                >
                  <span>{day}</span>
                  {isCompleted && <CheckCircle2 className="h-3 w-3 mt-0.5" />}
                  {isLocked && <Lock className="h-3 w-3 mt-0.5" />}
                </Link>
              )
            })}
          </div>

          {/* Current Day Quick Access */}
          {currentDay >= phases[activePhase].range[0] && currentDay <= phases[activePhase].range[1] && (
            <div className="mt-6 p-4 rounded-lg bg-accent/5 border border-accent/20">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Continue Your Journey</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Day {currentDay}: {lessons.find(l => l.day_number === currentDay)?.focus_reframe_technique || "Today's Focus"}
                  </p>
                </div>
                <Link href={`/dashboard/lessons/${currentDay}`}>
                  <Button>
                    Start Day {currentDay}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Milestones */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10">
                <Star className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Points</p>
                <p className="text-2xl font-bold">{totalPoints}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Days Completed</p>
                <p className="text-2xl font-bold">{completedDays.size}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                <Target className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phases Completed</p>
                <p className="text-2xl font-bold">{currentPhaseIndex >= 0 ? currentPhaseIndex : 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
                <Calendar className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Days Remaining</p>
                <p className="text-2xl font-bold">{90 - completedDays.size}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
