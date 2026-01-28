"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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

const focusAreaColors: Record<string, string> = {
  "Awareness": "bg-signal-awareness text-white",
  "Interpretation": "bg-signal-interpretation text-white",
  "Alignment": "bg-signal-alignment text-foreground",
  "Execution": "bg-signal-execution text-white",
  "Leadership Identity": "bg-signal-identity text-white",
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
        {phases.map(phase => {
          const phaseCompleted = Array.from({ length: phase.range[1] - phase.range[0] + 1 }, (_, i) => phase.range[0] + i)
            .filter(day => completedDays.has(day)).length
          const phaseTotal = phase.range[1] - phase.range[0] + 1
          const percentage = Math.round((phaseCompleted / phaseTotal) * 100)

          return (
            <Card key={phase.letter} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                    {phase.letter}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{phase.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {phaseCompleted}/{phaseTotal} days
                    </p>
                  </div>
                </div>
                <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
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

          return (
            <Card 
              key={lesson.id}
              className={cn(
                "group transition-all hover:shadow-md",
                isCurrent && "ring-2 ring-accent",
                isLocked && "opacity-60"
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    ) : isLocked ? (
                      <Lock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    )}
                    <span className="text-sm font-medium">Day {lesson.day_number}</span>
                    {isCurrent && (
                      <Badge variant="secondary" className="text-xs">Current</Badge>
                    )}
                  </div>
                  <Badge 
                    className={cn(
                      "text-xs",
                      focusAreaColors[lesson.focus_area] || "bg-muted text-muted-foreground"
                    )}
                  >
                    {lesson.focus_area}
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
                    className="w-full"
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
