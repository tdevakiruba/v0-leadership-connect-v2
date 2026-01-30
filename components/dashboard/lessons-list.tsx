"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  CheckCircle2, 
  Circle, 
  Lock,
  ArrowRight,
  Filter,
  ChevronDown,
  BookOpen
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface Lesson {
  id: string
  day_number: number
  focus_area: string
  focus_reframe_technique: string | null
  leader_example: string | null
  thought_to_work_on: string | null
  action_for_today: string | null
}

interface Progress {
  day_number: number
  completed: boolean
  actions_completed?: number[]
}

interface LessonsListProps {
  lessons: Lesson[]
  progress: Progress[]
}

// SIGNAL phases
const phases = [
  { letter: "S", name: "Self-Awareness", dayStart: 1, dayEnd: 15, color: "signal-s" },
  { letter: "I", name: "Interpretation", dayStart: 16, dayEnd: 30, color: "signal-i" },
  { letter: "G", name: "Goals & Strategy", dayStart: 31, dayEnd: 45, color: "signal-g" },
  { letter: "N", name: "Navigation", dayStart: 46, dayEnd: 60, color: "signal-n" },
  { letter: "A", name: "Action & Execution", dayStart: 61, dayEnd: 75, color: "signal-a" },
  { letter: "L", name: "Leadership Identity", dayStart: 76, dayEnd: 90, color: "signal-l" },
]

const getPhaseForDay = (day: number) => {
  return phases.find(p => day >= p.dayStart && day <= p.dayEnd) || phases[0]
}

export function LessonsList({ lessons, progress }: LessonsListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activePhase, setActivePhase] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const completedDays = new Set(progress.filter(p => p.completed).map(p => p.day_number))
  const currentDay = completedDays.size > 0 
    ? Math.min(Math.max(...completedDays) + 1, 90)
    : 1
  
  const currentPhase = getPhaseForDay(currentDay)

  // Filter lessons
  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = searchQuery === "" || 
      lesson.focus_reframe_technique?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.leader_example?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `day ${lesson.day_number}`.includes(searchQuery.toLowerCase())

    const matchesPhase = !activePhase || getPhaseForDay(lesson.day_number).letter === activePhase

    return matchesSearch && matchesPhase
  })

  // Group by phase for display
  const lessonsByPhase = phases.map(phase => ({
    ...phase,
    lessons: filteredLessons.filter(l => l.day_number >= phase.dayStart && l.day_number <= phase.dayEnd),
    completed: Array.from({ length: phase.dayEnd - phase.dayStart + 1 }, (_, i) => phase.dayStart + i)
      .filter(day => completedDays.has(day)).length,
    total: phase.dayEnd - phase.dayStart + 1
  }))

  const totalCompleted = completedDays.size
  const overallProgress = Math.round((totalCompleted / 90) * 100)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="border-b border-border/40 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="space-y-4">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                SIGNAL™ Framework Library
              </p>
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-balance">
                Leadership<br />
                <span className="text-signal-s">Frameworks</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                90 days of structured leadership development, designed for executives who lead with intention.
              </p>
            </div>
            
            {/* Progress Summary */}
            <div className="flex items-center gap-8">
              <div className="text-center">
                <p className="text-4xl font-bold">{totalCompleted}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="text-center">
                <p className="text-4xl font-bold">{90 - totalCompleted}</p>
                <p className="text-sm text-muted-foreground">Remaining</p>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="text-center">
                <p className="text-4xl font-bold text-signal-s">{overallProgress}%</p>
                <p className="text-sm text-muted-foreground">Progress</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Phase Navigation */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border/40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-1 py-4 overflow-x-auto">
            <button
              onClick={() => setActivePhase(null)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap",
                !activePhase 
                  ? "bg-foreground text-background" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              All Phases
            </button>
            {phases.map(phase => {
              const phaseData = lessonsByPhase.find(p => p.letter === phase.letter)
              const isActive = activePhase === phase.letter
              const isCurrent = currentPhase.letter === phase.letter
              
              return (
                <button
                  key={phase.letter}
                  onClick={() => setActivePhase(isActive ? null : phase.letter)}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap flex items-center gap-2",
                    isActive 
                      ? `bg-${phase.color} text-white` 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <span className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                    isActive ? "bg-white/20" : `bg-${phase.color}-light text-${phase.color}`
                  )}>
                    {phase.letter}
                  </span>
                  <span className="hidden sm:inline">{phase.name}</span>
                  {isCurrent && !isActive && (
                    <span className="w-2 h-2 rounded-full bg-signal-s animate-pulse" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Search & Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Search Bar */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by framework, leader, or day..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 rounded-full border-border/60 bg-muted/30 focus:bg-background"
            />
          </div>
          <Button 
            variant="outline" 
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Current Day Highlight */}
        {!activePhase && !searchQuery && (
          <div className="mb-12 p-8 rounded-2xl bg-gradient-to-br from-signal-s/5 via-transparent to-signal-g/5 border border-border/40">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-signal-s uppercase tracking-wider">Continue Your Journey</p>
                <h2 className="text-2xl font-bold">
                  Day {currentDay}: {lessons.find(l => l.day_number === currentDay)?.focus_reframe_technique || "Today's Framework"}
                </h2>
                <p className="text-muted-foreground">
                  {lessons.find(l => l.day_number === currentDay)?.leader_example || currentPhase.name + " Phase"}
                </p>
              </div>
              <Link href={`/dashboard/lessons/${currentDay}`}>
                <Button size="lg" className="rounded-full bg-signal-s hover:bg-signal-s/90 px-8">
                  Start Day {currentDay}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Framework List */}
        <div className="space-y-12">
          {lessonsByPhase.filter(phase => phase.lessons.length > 0).map(phase => (
            <div key={phase.letter}>
              {/* Phase Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold text-white",
                  `bg-${phase.color}`
                )}>
                  {phase.letter}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{phase.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Days {phase.dayStart}-{phase.dayEnd} · {phase.completed}/{phase.total} completed
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <div className={cn("w-24 h-1.5 rounded-full", `bg-${phase.color}-light`)}>
                    <div 
                      className={cn("h-full rounded-full", `bg-${phase.color}`)}
                      style={{ width: `${(phase.completed / phase.total) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">{Math.round((phase.completed / phase.total) * 100)}%</span>
                </div>
              </div>

              {/* Framework Items */}
              <div className="space-y-2">
                {phase.lessons.map(lesson => {
                  const isCompleted = completedDays.has(lesson.day_number)
                  const isCurrent = lesson.day_number === currentDay
                  const isLocked = lesson.day_number > currentDay && !isCompleted

                  return (
                    <Link
                      key={lesson.id}
                      href={isLocked ? "#" : `/dashboard/lessons/${lesson.day_number}`}
                      onClick={(e) => isLocked && e.preventDefault()}
                      className={cn(
                        "group flex items-center gap-4 p-4 rounded-xl transition-all",
                        isCurrent && "bg-signal-s/5 border border-signal-s/20",
                        !isCurrent && !isLocked && "hover:bg-muted/50",
                        isLocked && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {/* Status Icon */}
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                        isCompleted && `bg-${phase.color} text-white`,
                        isCurrent && !isCompleted && `bg-${phase.color}-light text-${phase.color}`,
                        !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                      )}>
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : isLocked ? (
                          <Lock className="h-4 w-4" />
                        ) : (
                          <span className="font-semibold text-sm">{lesson.day_number}</span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground font-medium">DAY {lesson.day_number}</span>
                          {isCurrent && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-signal-s text-white">
                              Current
                            </span>
                          )}
                        </div>
                        <h4 className="font-medium truncate group-hover:text-signal-s transition-colors">
                          {lesson.focus_reframe_technique || `Day ${lesson.day_number} Framework`}
                        </h4>
                        {lesson.leader_example && (
                          <p className="text-sm text-muted-foreground truncate">
                            {lesson.leader_example}
                          </p>
                        )}
                      </div>

                      {/* Action */}
                      {!isLocked && (
                        <ArrowRight className={cn(
                          "h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity",
                          isCurrent && "opacity-100 text-signal-s"
                        )} />
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredLessons.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">No frameworks found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your search or filter criteria
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => { setSearchQuery(""); setActivePhase(null); }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
