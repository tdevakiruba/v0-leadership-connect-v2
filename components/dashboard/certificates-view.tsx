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
  Trophy,
  Star,
  Target,
  Sparkles
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

// SIGNAL™ Certificates with Monochromatic Blue-Teal Gradient Palette
const certificates = [
  {
    id: "phase-s",
    name: "Self-Awareness Mastery",
    phase: "S",
    description: "Completed the Self-Awareness phase of the SIGNAL™ leadership framework",
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
    name: "Interpretation Expert",
    phase: "I",
    description: "Mastered reframing challenges as opportunities through the Interpretation phase",
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
    name: "Strategic Alignment",
    phase: "G",
    description: "Achieved alignment between vision and strategy in the Goals phase",
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
    name: "Navigation Navigator",
    phase: "N",
    description: "Developed skills to navigate complexity with clarity and purpose",
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
    name: "Action Authority",
    phase: "A",
    description: "Demonstrated execution excellence and adaptability",
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
    name: "Leadership Identity",
    phase: "L",
    description: "Embodied your transformed leadership presence",
    requirement: 90,
    startDay: 76,
    endDay: 90,
    color: "signal-l",
    bg: "bg-signal-l",
    bgLight: "bg-signal-l-light",
    text: "text-signal-l",
    icon: "L"
  },
  {
    id: "full-completion",
    name: "SIGNAL™ Leadership Certification",
    phase: "SIGNAL™",
    description: "Completed the entire 90-day Leadership Reboot program",
    requirement: 90,
    startDay: 1,
    endDay: 90,
    color: "signal-l",
    bg: "bg-signal-l",
    bgLight: "bg-signal-l-light",
    text: "text-signal-l",
    icon: "★"
  }
]

const milestones = [
  { id: "first-week", name: "First Week Complete", requirement: 7, icon: "🌟" },
  { id: "two-weeks", name: "Two Weeks Strong", requirement: 14, icon: "💪" },
  { id: "month-one", name: "First Month", requirement: 30, icon: "🏆" },
  { id: "halfway", name: "Halfway There", requirement: 45, icon: "⚡" },
  { id: "two-months", name: "60 Days", requirement: 60, icon: "🔥" },
  { id: "final-stretch", name: "Final Stretch", requirement: 75, icon: "🎯" },
  { id: "complete", name: "Journey Complete", requirement: 90, icon: "👑" }
]

export function CertificatesView({
  user,
  profile,
  progress,
}: CertificatesViewProps) {
  const completedDays = progress.filter(p => p.completed).map(p => p.day_number)
  const totalCompleted = completedDays.length
  const totalPoints = progress.reduce((sum, p) => sum + (p.points_awarded || 0), 0)

  const getCertificateStatus = (cert: typeof certificates[0]) => {
    const phaseDays = Array.from(
      { length: cert.endDay - cert.startDay + 1 },
      (_, i) => cert.startDay + i
    )
    const completedInPhase = phaseDays.filter(day => completedDays.includes(day)).length
    const totalInPhase = phaseDays.length
    const isEarned = completedInPhase === totalInPhase
    const percentage = Math.round((completedInPhase / totalInPhase) * 100)
    
    return { isEarned, completedInPhase, totalInPhase, percentage }
  }

  const earnedCertificates = certificates.filter(cert => getCertificateStatus(cert).isEarned)
  const earnedMilestones = milestones.filter(m => totalCompleted >= m.requirement)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Certificates & Achievements</h1>
          <p className="text-muted-foreground mt-1">
            Track your progress and earn certificates as you complete your leadership journey
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="gap-1.5 py-1.5 px-3">
            <Trophy className="h-4 w-4 text-signal-s" />
            {earnedCertificates.length} Certificates
          </Badge>
          <Badge variant="secondary" className="gap-1.5 py-1.5 px-3">
            <Star className="h-4 w-4 text-signal-s" />
            {earnedMilestones.length} Milestones
          </Badge>
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Overall Completion</span>
                <span className="font-medium">{totalCompleted}/90 days ({Math.round((totalCompleted / 90) * 100)}%)</span>
              </div>
              <Progress value={(totalCompleted / 90) * 100} className="h-3" />
            </div>
            <div className="grid grid-cols-2 gap-4 lg:w-auto">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">{totalPoints}</p>
                <p className="text-xs text-muted-foreground">Leadership Index</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">{earnedCertificates.length}</p>
                <p className="text-xs text-muted-foreground">Certificates</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SIGNAL™ Certificates */}
      <div>
        <h2 className="text-lg font-semibold mb-4">SIGNAL&trade; Phase Certificates</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map(cert => {
            const status = getCertificateStatus(cert)
            
            return (
              <Card 
                key={cert.id}
                className={cn(
                  "relative overflow-hidden transition-all",
                  status.isEarned 
                    ? "ring-2 ring-accent bg-gradient-to-br from-accent/5 to-transparent" 
                    : "opacity-75"
                )}
              >
                {status.isEarned && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle2 className="h-6 w-6 text-signal-g" />
                  </div>
                )}
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
<div className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold",
                    status.isEarned 
                      ? `${cert.bg} text-white` 
                      : `${cert.bgLight} ${cert.text}`
                  )}>
                      {cert.icon}
                    </div>
                    <div>
                      <CardTitle className="text-base">{cert.name}</CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        Days {cert.startDay}-{cert.endDay}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {cert.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{status.completedInPhase}/{status.totalInPhase}</span>
                    </div>
                    <Progress value={status.percentage} className="h-2" />
                  </div>
                  {status.isEarned ? (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Lock className="h-4 w-4" />
                      Complete {status.totalInPhase - status.completedInPhase} more days to unlock
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Milestones */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Milestones</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {milestones.map(milestone => {
                const isEarned = totalCompleted >= milestone.requirement
                const progress = Math.min((totalCompleted / milestone.requirement) * 100, 100)
                
                return (
                  <div 
                    key={milestone.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border transition-all",
                      isEarned 
                        ? "bg-accent/5 border-accent/20" 
                        : "border-transparent bg-muted/30"
                    )}
                  >
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full text-lg",
                      isEarned ? "bg-accent/10" : "bg-muted grayscale"
                    )}>
                      {milestone.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm font-medium truncate",
                        !isEarned && "text-muted-foreground"
                      )}>
                        {milestone.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isEarned ? "Achieved!" : `${milestone.requirement - totalCompleted} days to go`}
                      </p>
                    </div>
                    {isEarned && (
                      <CheckCircle2 className="h-5 w-5 text-signal-g flex-shrink-0" />
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Full Certificate Preview */}
      {earnedCertificates.find(c => c.id === "full-completion") && (
        <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 border-2 border-accent/20">
          <CardContent className="py-12 text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-accent to-primary text-white">
                <Award className="h-10 w-10" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Congratulations, {profile?.full_name || "Leader"}!</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              You have successfully completed the 90-day Leadership Reboot program 
              and earned your SIGNAL&trade; Leadership Certification.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg">
                <Download className="mr-2 h-5 w-5" />
                Download Certificate
              </Button>
              <Button variant="outline" size="lg">
                <Share2 className="mr-2 h-5 w-5" />
                Share on LinkedIn
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Achievements */}
      {!earnedCertificates.find(c => c.id === "full-completion") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              Keep Going!
            </CardTitle>
            <CardDescription>
              You're making great progress. Here's what's coming up next.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {certificates
                .filter(cert => !getCertificateStatus(cert).isEarned)
                .slice(0, 2)
                .map(cert => {
                  const status = getCertificateStatus(cert)
                  return (
                    <div key={cert.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground font-bold">
                        {cert.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{cert.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {status.totalInPhase - status.completedInPhase} days remaining
                        </p>
                      </div>
                      <Progress value={status.percentage} className="w-20 h-2" />
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
