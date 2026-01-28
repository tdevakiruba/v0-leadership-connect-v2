"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Search, 
  CheckCircle2, 
  Circle, 
  Lock,
  ChevronRight,
  BookOpen,
  Target,
  Square,
  CheckSquare,
  Loader2,
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { generateBoldActions, toggleActionCompleted, saveActionsToProgress } from "@/app/actions/ai-actions"
import { toast } from "sonner"

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
  ai_actions?: ActionItem[]
}

interface ActionItem {
  id: number
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'bold'
  isFromDB?: boolean
}

interface LessonsListProps {
  lessons: Lesson[]
  progress: Progress[]
}

const focusAreas = [
  "All",
  "Awareness",
  "Interpretation", 
  "Alignment",
  "Execution",
  "Leadership Identity"
]

// SIGNAL™ phase color configurations
const signalPhaseColors = [
  { letter: "S", name: "Self-Awareness", dayStart: 1, dayEnd: 15, bg: "bg-lime-500", text: "text-white", bgLight: "bg-lime-100", textLight: "text-lime-600" },
  { letter: "I", name: "Interpretation", dayStart: 16, dayEnd: 30, bg: "bg-amber-500", text: "text-white", bgLight: "bg-amber-100", textLight: "text-amber-600" },
  { letter: "G", name: "Goals & Strategy", dayStart: 31, dayEnd: 45, bg: "bg-emerald-500", text: "text-white", bgLight: "bg-emerald-100", textLight: "text-emerald-600" },
  { letter: "N", name: "Navigation", dayStart: 46, dayEnd: 60, bg: "bg-cyan-500", text: "text-white", bgLight: "bg-cyan-100", textLight: "text-cyan-600" },
  { letter: "A", name: "Action & Execution", dayStart: 61, dayEnd: 75, bg: "bg-violet-500", text: "text-white", bgLight: "bg-violet-100", textLight: "text-violet-600" },
  { letter: "L", name: "Leadership Identity", dayStart: 76, dayEnd: 90, bg: "bg-indigo-500", text: "text-white", bgLight: "bg-indigo-100", textLight: "text-indigo-600" },
]

const getPhaseForDay = (day: number) => {
  return signalPhaseColors.find(p => day >= p.dayStart && day <= p.dayEnd) || signalPhaseColors[0]
}

const focusAreaColors: Record<string, string> = {
  "Awareness": "bg-lime-500 text-white",
  "Interpretation": "bg-amber-500 text-white",
  "Alignment": "bg-emerald-500 text-white",
  "Execution": "bg-cyan-500 text-white",
  "Leadership Identity": "bg-violet-500 text-white",
}

export function LessonsList({ lessons, progress }: LessonsListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedArea, setSelectedArea] = useState("All")

  const completedDays = new Set(progress.filter(p => p.completed).map(p => p.day_number))
  const currentDay = completedDays.size > 0 
    ? Math.min(Math.max(...completedDays) + 1, 90)
    : 1

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = 
      lesson.focus_reframe_technique?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.leader_example?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.thought_to_work_on?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `day ${lesson.day_number}`.includes(searchQuery.toLowerCase())

    const matchesArea = selectedArea === "All" || lesson.focus_area === selectedArea

    return matchesSearch && matchesArea
  })

  // Group lessons by SIGNAL phase
  const phases = [
    { name: "Self-Awareness", range: [1, 15], letter: "S" },
    { name: "Interpretation", range: [16, 30], letter: "I" },
    { name: "Goals & Strategy", range: [31, 45], letter: "G" },
    { name: "Navigation", range: [46, 60], letter: "N" },
    { name: "Action & Execution", range: [61, 75], letter: "A" },
    { name: "Leadership Identity", range: [76, 90], letter: "L" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Daily Lessons</h1>
        <p className="text-muted-foreground mt-1">
          Browse all 90 days of your leadership transformation curriculum
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search lessons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedArea} onValueChange={setSelectedArea}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by area" />
          </SelectTrigger>
          <SelectContent>
            {focusAreas.map(area => (
              <SelectItem key={area} value={area}>{area}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Progress Overview */}
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {signalPhaseColors.map(phase => {
          const phaseCompleted = Array.from({ length: phase.dayEnd - phase.dayStart + 1 }, (_, i) => phase.dayStart + i)
            .filter(day => completedDays.has(day)).length
          const phaseTotal = phase.dayEnd - phase.dayStart + 1
          const percentage = Math.round((phaseCompleted / phaseTotal) * 100)
          const isActive = currentDay >= phase.dayStart && currentDay <= phase.dayEnd

          return (
            <Card key={phase.letter} className={cn("overflow-hidden", isActive && "ring-2 ring-offset-2", isActive && `ring-${phase.bg.replace('bg-', '')}`)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full font-bold",
                    isActive ? `${phase.bg} ${phase.text}` : `${phase.bgLight} ${phase.textLight}`
                  )}>
                    {phase.letter}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-xs font-medium truncate", isActive && phase.textLight)}>{phase.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {phaseCompleted}/{phaseTotal} days
                    </p>
                  </div>
                </div>
                <div className={cn("mt-3 h-1.5 rounded-full overflow-hidden", phase.bgLight)}>
                  <div 
                    className={cn("h-full transition-all duration-300", phase.bg)}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Lessons Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredLessons.map(lesson => {
          const isCompleted = completedDays.has(lesson.day_number)
          const isCurrent = lesson.day_number === currentDay
          const isLocked = lesson.day_number > currentDay && !isCompleted
          const lessonPhase = getPhaseForDay(lesson.day_number)

          return (
            <Card 
              key={lesson.id}
              className={cn(
                "group transition-all hover:shadow-md",
                isCurrent && "ring-2",
                isCurrent && lessonPhase.bg.replace('bg-', 'ring-'),
                isLocked && "opacity-60"
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {isCompleted ? (
                      <CheckCircle2 className={cn("h-5 w-5 flex-shrink-0", lessonPhase.textLight)} />
                    ) : isLocked ? (
                      <Lock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <Circle className={cn("h-5 w-5 flex-shrink-0", lessonPhase.textLight)} />
                    )}
                    <span className="text-sm font-medium">Day {lesson.day_number}</span>
                    {isCurrent && (
                      <Badge className={cn("text-xs", lessonPhase.bgLight, lessonPhase.textLight)}>Current</Badge>
                    )}
                  </div>
                  <Badge 
                    className={cn(
                      "text-xs",
                      lessonPhase.bg, lessonPhase.text
                    )}
                  >
                    {lessonPhase.letter}
                  </Badge>
                </div>
                <CardTitle className="text-base line-clamp-2 mt-2">
                  {lesson.focus_reframe_technique || `Day ${lesson.day_number} Focus`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {lesson.leader_example && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {lesson.leader_example}
                  </p>
                )}
                <Link href={`/dashboard/lessons/${lesson.day_number}`}>
                  <Button 
                    variant={isCurrent ? "default" : "outline"} 
                    size="sm" 
                    className={cn("w-full", isCurrent && lessonPhase.bg)}
                    disabled={isLocked}
                  >
                    {isCompleted ? "Review" : isCurrent ? "Start Today" : "View"}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredLessons.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">No lessons found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your search or filter criteria
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
