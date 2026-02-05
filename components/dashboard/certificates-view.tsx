"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Award, 
  Download, 
  Share2, 
  Lock,
  CheckCircle2,
  Shield,
  Target,
  TrendingUp,
  Zap,
  ArrowRight,
  ChevronRight,
  Flame,
  Activity
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { User } from "@supabase/supabase-js"

interface Profile {
  id: string
  full_name: string | null
  email: string | null
  title: string | null
  company: string | null
}

interface UserProgress {
  day_number: number
  completed: boolean
  points_awarded: number
  completed_at: string | null
}

interface CertificatesViewProps {
  user: User
  profile: Profile | null
  progress: UserProgress[]
}

// Leadership Milestones with Executive Language
const milestones = [
  {
    id: "phase-s",
    name: "Self-Awareness Leadership Signal",
    phase: "S",
    capability: "Self-Awareness Mastery",
    outcome: "You now recognize emotional signal patterns in decision environments.",
    description: "Foundational clarity on leadership identity and behavioral patterns",
    requirement: 15,
    startDay: 1,
    endDay: 15,
    color: "signal-s",
    bg: "bg-signal-s",
    bgLight: "bg-signal-s-light",
    text: "text-signal-s",
    icon: "S"
  },
  {
    id: "phase-i",
    name: "Strategic Interpretation Capability",
    phase: "I",
    capability: "Interpretation Expert",
    outcome: "You reframe challenges as strategic opportunities with clarity.",
    description: "Mastered cognitive reframing and situational analysis",
    requirement: 30,
    startDay: 16,
    endDay: 30,
    color: "signal-i",
    bg: "bg-signal-i",
    bgLight: "bg-signal-i-light",
    text: "text-signal-i",
    icon: "I"
  },
  {
    id: "phase-g",
    name: "Strategic Alignment Authority",
    phase: "G",
    capability: "Vision-Strategy Alignment",
    outcome: "Your decisions align seamlessly with long-term strategic outcomes.",
    description: "Achieved alignment between vision and execution strategy",
    requirement: 45,
    startDay: 31,
    endDay: 45,
    color: "signal-g",
    bg: "bg-signal-g",
    bgLight: "bg-signal-g-light",
    text: "text-signal-g",
    icon: "G"
  },
  {
    id: "phase-n",
    name: "Complexity Navigation Signal",
    phase: "N",
    capability: "Navigation Navigator",
    outcome: "You navigate organizational complexity with clarity and purpose.",
    description: "Developed skills to lead through uncertainty and ambiguity",
    requirement: 60,
    startDay: 46,
    endDay: 60,
    color: "signal-n",
    bg: "bg-signal-n",
    bgLight: "bg-signal-n-light",
    text: "text-signal-n",
    icon: "N"
  },
  {
    id: "phase-a",
    name: "Execution Authority Activated",
    phase: "A",
    capability: "Action Authority",
    outcome: "Your execution velocity matches strategic intention perfectly.",
    description: "Demonstrated execution excellence and adaptive leadership",
    requirement: 75,
    startDay: 61,
    endDay: 75,
    color: "signal-a",
    bg: "bg-signal-a",
    bgLight: "bg-signal-a-light",
    text: "text-signal-a",
    icon: "A"
  },
  {
    id: "phase-l",
    name: "Leadership Identity Embodied",
    phase: "L",
    capability: "Leadership Presence",
    outcome: "Your leadership presence is now fully integrated and authentic.",
    description: "Embodied your transformed leadership identity",
    requirement: 90,
    startDay: 76,
    endDay: 90,
    color: "signal-l",
    bg: "bg-signal-l",
    bgLight: "bg-signal-l-light",
    text: "text-signal-l",
    icon: "L"
  }
]

// Journey milestones with executive language
const journeyMarkers = [
  { id: "first-week", name: "Foundation Established", requirement: 7 },
  { id: "two-weeks", name: "Pattern Recognition Active", requirement: 14 },
  { id: "month-one", name: "First Transformation Cycle", requirement: 30 },
  { id: "halfway", name: "Strategic Midpoint", requirement: 45 },
  { id: "two-months", name: "Momentum Achieved", requirement: 60 },
  { id: "final-stretch", name: "Authority Phase", requirement: 75 },
  { id: "complete", name: "Transformation Complete", requirement: 90 }
]

// Leadership trajectory phases
const trajectoryPhases = [
  { label: "Reactive", range: [0, 15], active: false },
  { label: "Interpretive", range: [16, 45], active: false },
  { label: "Strategic", range: [46, 75], active: false },
  { label: "Authority", range: [76, 90], active: false }
]

export function CertificatesView({
  user,
  profile,
  progress,
}: CertificatesViewProps) {
  const completedDays = progress.filter(p => p.completed).map(p => p.day_number)
  const totalCompleted = completedDays.length
  const totalPoints = progress.reduce((sum, p) => sum + (p.points_awarded || 0), 0)

  // Calculate Leadership Transformation Score (weighted by phase difficulty)
  const transformationScore = Math.min(Math.round((totalPoints / 900) * 100), 100)

  // Calculate streak (consecutive days)
  const calculateStreak = () => {
    if (completedDays.length === 0) return 0
    const sortedDays = [...completedDays].sort((a, b) => b - a)
    let streak = 1
    for (let i = 0; i < sortedDays.length - 1; i++) {
      if (sortedDays[i] - sortedDays[i + 1] === 1) {
        streak++
      } else {
        break
      }
    }
    return streak
  }
  const streak = calculateStreak()

  const getMilestoneStatus = (milestone: typeof milestones[0]) => {
    const phaseDays = Array.from(
      { length: milestone.endDay - milestone.startDay + 1 },
      (_, i) => milestone.startDay + i
    )
    const completedInPhase = phaseDays.filter(day => completedDays.includes(day)).length
    const totalInPhase = phaseDays.length
    const isEarned = completedInPhase === totalInPhase
    const percentage = Math.round((completedInPhase / totalInPhase) * 100)
    
    return { isEarned, completedInPhase, totalInPhase, percentage }
  }

  const earnedMilestones = milestones.filter(m => getMilestoneStatus(m).isEarned)
  const earnedJourneyMarkers = journeyMarkers.filter(m => totalCompleted >= m.requirement)

  // Determine current trajectory phase
  const currentTrajectory = trajectoryPhases.map(phase => ({
    ...phase,
    active: totalCompleted >= phase.range[0] && totalCompleted <= phase.range[1]
  }))

  // Get next unlock
  const nextMilestone = milestones.find(m => !getMilestoneStatus(m).isEarned)
  const nextMilestoneStatus = nextMilestone ? getMilestoneStatus(nextMilestone) : null

  // Current phase info
  const currentPhase = milestones.find(m => {
    const status = getMilestoneStatus(m)
    return !status.isEarned && status.percentage > 0
  }) || milestones.find(m => !getMilestoneStatus(m).isEarned) || milestones[milestones.length - 1]

  return (
    <div className="space-y-6">
      {/* Executive Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Leadership Transformation</h1>
        <p className="text-muted-foreground">
          Your executive milestones and leadership capability progression
        </p>
      </div>

      {/* Leadership Performance Summary - KPI Band */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Leadership Transformation Score */}
        <Card className="relative overflow-hidden border-l-4 border-l-accent">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Leadership Score
                </p>
                <p className="text-3xl font-bold mt-1">{transformationScore}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Transformation Index
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Phase Progress */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Phase Progress
                </p>
                <p className="text-3xl font-bold mt-1">{Math.round((totalCompleted / 90) * 100)}%</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {totalCompleted}/90 Days
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <Target className="h-5 w-5 text-foreground/70" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Momentum / Streak */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Momentum
                </p>
                <p className="text-3xl font-bold mt-1">{streak}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Day Streak
                </p>
              </div>
              <div className={cn(
                "h-10 w-10 rounded-lg flex items-center justify-center",
                streak >= 7 ? "bg-signal-g/10" : "bg-muted"
              )}>
                <Flame className={cn(
                  "h-5 w-5",
                  streak >= 7 ? "text-signal-g" : "text-foreground/70"
                )} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Milestones Unlocked */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Milestones
                </p>
                <p className="text-3xl font-bold mt-1">{earnedMilestones.length}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  of {milestones.length} Unlocked
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <Shield className="h-5 w-5 text-foreground/70" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leadership Trajectory Narrative */}
      <Card className="bg-gradient-to-r from-muted/30 to-transparent border-0">
        <CardContent className="py-4 px-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Your leadership trajectory is shifting from</p>
              <div className="flex items-center gap-2 flex-wrap">
                {currentTrajectory.map((phase, idx) => (
                  <div key={phase.label} className="flex items-center gap-2">
                    <span className={cn(
                      "text-sm font-medium px-2.5 py-1 rounded-md transition-all",
                      phase.active 
                        ? "bg-accent text-accent-foreground" 
                        : totalCompleted > phase.range[1]
                          ? "bg-signal-g/10 text-signal-g"
                          : "text-muted-foreground"
                    )}>
                      {phase.label}
                    </span>
                    {idx < currentTrajectory.length - 1 && (
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                    )}
                  </div>
                ))}
              </div>
            </div>
            {nextMilestone && nextMilestoneStatus && (
              <div className="flex items-center gap-3 bg-background/50 rounded-lg p-3">
                <div className={cn(
                  "h-9 w-9 rounded-lg flex items-center justify-center text-sm font-bold",
                  nextMilestone.bgLight, nextMilestone.text
                )}>
                  {nextMilestone.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Next Unlock</p>
                  <p className="text-sm font-medium truncate">{nextMilestone.capability}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{nextMilestoneStatus.totalInPhase - nextMilestoneStatus.completedInPhase}</p>
                  <p className="text-xs text-muted-foreground">days left</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Leadership Milestones Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Executive Milestones</h2>
          <Badge variant="secondary" className="gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            {earnedMilestones.length} Achieved
          </Badge>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {milestones.map(milestone => {
            const status = getMilestoneStatus(milestone)
            const isCurrent = !status.isEarned && status.percentage > 0
            
            return (
              <Card 
                key={milestone.id}
                className={cn(
                  "relative overflow-hidden transition-all group",
                  status.isEarned 
                    ? "ring-1 ring-accent/50 bg-gradient-to-br from-accent/5 to-transparent" 
                    : isCurrent
                      ? "ring-2 ring-accent/30 shadow-md"
                      : "opacity-60 hover:opacity-80"
                )}
              >
                {/* Phase accent bar */}
                <div className={cn(
                  "absolute left-0 top-0 bottom-0 w-1",
                  status.isEarned ? milestone.bg : isCurrent ? "bg-accent" : "bg-muted"
                )} />
                
                {/* Current indicator */}
                {isCurrent && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-accent text-accent-foreground text-[10px] px-1.5 py-0.5 animate-pulse">
                      IN PROGRESS
                    </Badge>
                  </div>
                )}
                
                {/* Earned checkmark */}
                {status.isEarned && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle2 className="h-5 w-5 text-signal-g" />
                  </div>
                )}

                <CardContent className="p-4 pl-5">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-xl text-base font-bold shrink-0 transition-transform group-hover:scale-105",
                      status.isEarned 
                        ? `${milestone.bg} text-white shadow-sm` 
                        : `${milestone.bgLight} ${milestone.text}`
                    )}>
                      {milestone.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Phase {milestone.phase}
                      </p>
                      <p className="font-semibold text-sm mt-0.5 leading-tight">
                        {milestone.capability}
                      </p>
                    </div>
                  </div>
                  
                  {/* Outcome - visible when earned or in progress */}
                  {(status.isEarned || isCurrent) && (
                    <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                      {milestone.outcome}
                    </p>
                  )}
                  
                  {/* Locked preview */}
                  {!status.isEarned && !isCurrent && (
                    <p className="text-xs text-muted-foreground/70 mt-3 leading-relaxed italic">
                      Unlocks when {milestone.description.toLowerCase()}
                    </p>
                  )}
                  
                  {/* Progress section */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Progress to mastery
                      </span>
                      <span className="text-xs font-medium">
                        {status.completedInPhase}/{status.totalInPhase}
                      </span>
                    </div>
                    <Progress 
                      value={status.percentage} 
                      className={cn(
                        "h-1.5",
                        status.isEarned && "[&>div]:bg-signal-g"
                      )} 
                    />
                  </div>
                  
                  {/* Actions for earned milestones */}
                  {status.isEarned && (
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1 h-8 text-xs bg-transparent">
                        <Download className="mr-1.5 h-3.5 w-3.5" />
                        Download
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 h-8 text-xs bg-transparent">
                        <Share2 className="mr-1.5 h-3.5 w-3.5" />
                        Share
                      </Button>
                    </div>
                  )}
                  
                  {/* Locked indicator */}
                  {!status.isEarned && !isCurrent && (
                    <div className="flex items-center gap-1.5 mt-4 text-xs text-muted-foreground/70">
                      <Lock className="h-3.5 w-3.5" />
                      {status.totalInPhase - status.completedInPhase} days to unlock
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Journey Markers - Compact */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Journey Markers</CardTitle>
            <span className="text-xs text-muted-foreground">
              {earnedJourneyMarkers.length}/{journeyMarkers.length} achieved
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            {journeyMarkers.map(marker => {
              const isEarned = totalCompleted >= marker.requirement
              return (
                <div 
                  key={marker.id}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all",
                    isEarned 
                      ? "bg-accent/10 text-foreground" 
                      : "bg-muted/50 text-muted-foreground"
                  )}
                >
                  {isEarned ? (
                    <CheckCircle2 className="h-4 w-4 text-signal-g" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                  )}
                  <span className={cn(!isEarned && "opacity-70")}>{marker.name}</span>
                  {!isEarned && (
                    <span className="text-xs ml-1">
                      ({marker.requirement - totalCompleted}d)
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Full Certification - Premium Card */}
      {earnedMilestones.length === milestones.length && (
        <Card className="bg-gradient-to-br from-accent/10 via-primary/5 to-accent/10 border-2 border-accent/30 overflow-hidden">
          <CardContent className="py-10 text-center relative">
            {/* Subtle pattern background */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }} />
            </div>
            
            <div className="relative">
              <div className="flex items-center justify-center mb-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-accent to-primary text-white shadow-lg">
                  <Award className="h-10 w-10" />
                </div>
              </div>
              <Badge className="mb-4 bg-accent/20 text-accent border-accent/30">
                SIGNAL&trade; Leadership Certified
              </Badge>
              <h2 className="text-2xl font-bold mb-2">
                Congratulations, {profile?.full_name || "Leader"}!
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto mb-6">
                You have completed your 90-day leadership transformation journey. 
                Your leadership capabilities have evolved from reactive to authoritative.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" className="gap-2">
                  <Download className="h-5 w-5" />
                  Download Certificate
                </Button>
                <Button variant="outline" size="lg" className="gap-2">
                  <Share2 className="h-5 w-5" />
                  Share on LinkedIn
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Capability Unlock - when not complete */}
      {earnedMilestones.length < milestones.length && (
        <Card className="border-dashed">
          <CardContent className="py-5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold">Continue Your Transformation</p>
                <p className="text-sm text-muted-foreground">
                  {nextMilestone 
                    ? `${nextMilestoneStatus?.totalInPhase! - nextMilestoneStatus?.completedInPhase!} days until you unlock ${nextMilestone.capability}`
                    : "Keep building your leadership capabilities"
                  }
                </p>
              </div>
              <Button className="gap-1.5 shrink-0">
                Continue
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
