"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Users, 
  Trophy, 
  Target,
  Plus,
  Crown,
  TrendingUp,
  Flame,
  MessageSquare,
  UserPlus,
  Settings,
  BookOpen
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { User } from "@supabase/supabase-js"

interface Profile {
  id: string
  full_name: string | null
  email: string | null
  title: string | null
  company: string | null
  avatar_url: string | null
  role: string
}

interface TeamMember extends Profile {
  teamRole: string
  progress: {
    day_number: number
    completed: boolean
    points_awarded: number
  }[]
}

interface Team {
  id: string
  name: string
  description: string | null
  role: string
  members: TeamMember[]
}

interface UserProgress {
  day_number: number
  completed: boolean
  points_awarded: number
}

interface LeadershipLabProps {
  user: User
  profile: Profile | null
  teams: Team[]
  userProgress: UserProgress[]
}

export function LeadershipLab({
  user,
  profile,
  teams,
  userProgress,
}: LeadershipLabProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const totalPoints = userProgress.reduce((sum, p) => sum + (p.points_awarded || 0), 0)
  const completedDays = userProgress.filter(p => p.completed).length

  // Calculate leaderboard from all team members
  const allMembers = teams.flatMap(team => team.members)
  const uniqueMembers = Array.from(
    new Map(allMembers.map(m => [m.id, m])).values()
  )
  const leaderboard = uniqueMembers
    .map(member => ({
      ...member,
      totalPoints: member.progress.reduce((sum, p) => sum + (p.points_awarded || 0), 0),
      completedDays: member.progress.filter(p => p.completed).length
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 10)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight section-title-executive">Decision Lab</h1>
          <p className="text-muted-foreground mt-1">
            Connect with your leadership cohort and track team progress
          </p>
        </div>
        {profile?.role === "team_lead" || profile?.role === "admin" ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Team</DialogTitle>
                <DialogDescription>
                  Create a leadership pod to track team progress together.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="team-name">Team Name</Label>
                  <Input id="team-name" placeholder="e.g., Executive Leadership Cohort Q1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="team-desc">Description</Label>
                  <Input id="team-desc" placeholder="Brief description of your team" />
                </div>
                <Button className="w-full">Create Team</Button>
              </div>
            </DialogContent>
          </Dialog>
        ) : null}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="teams">My Teams</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Personal Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Trophy className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Leadership Index</p>
                    <p className="text-2xl font-bold">{totalPoints}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-signal-g-light">
                    <Target className="h-6 w-6 text-signal-g" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Days Completed</p>
                    <p className="text-2xl font-bold">{completedDays}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-signal-n-light">
                    <Users className="h-6 w-6 text-signal-n" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Teams</p>
                    <p className="text-2xl font-bold">{teams.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-signal-a-light">
                    <TrendingUp className="h-6 w-6 text-signal-a" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Rank</p>
                    <p className="text-2xl font-bold">
                      #{leaderboard.findIndex(m => m.id === user.id) + 1 || "-"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Team Activity</CardTitle>
                <CardDescription>Recent progress from your teams</CardDescription>
              </CardHeader>
              <CardContent>
                {teams.length > 0 ? (
                  <div className="space-y-4">
                    {teams.slice(0, 3).flatMap(team => 
                      team.members.slice(0, 2).map(member => (
                        <div key={`${team.id}-${member.id}`} className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.avatar_url || undefined} />
                            <AvatarFallback className="text-xs">
                              {member.full_name?.split(" ").map(n => n[0]).join("") || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {member.full_name || member.email}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Completed Day {member.progress.filter(p => p.completed).length} in {team.name}
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            +10 pts
                          </Badge>
                        </div>
                      ))
                    )}
                    {teams.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Join a team to see activity
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      You're not part of any teams yet
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Performers</CardTitle>
                <CardDescription>Leaders in your network</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboard.slice(0, 5).map((member, index) => (
                    <div key={member.id} className="flex items-center gap-3">
                      <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                        index === 0 ? "bg-signal-s text-white" :
                        index === 1 ? "bg-signal-g text-white" :
                        index === 2 ? "bg-signal-n text-white" :
                        "bg-muted text-muted-foreground"
                      )}>
                        {index + 1}
                      </div>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {member.full_name?.split(" ").map(n => n[0]).join("") || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {member.full_name || member.email}
                          {member.id === user.id && " (You)"}
                        </p>
                      </div>
                      <span className="text-sm font-semibold">{member.totalPoints} pts</span>
                    </div>
                  ))}
                  {leaderboard.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No leaderboard data yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="teams" className="space-y-6 mt-6">
          {teams.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {teams.map(team => {
                const teamProgress = team.members.reduce((sum, m) => 
                  sum + m.progress.filter(p => p.completed).length, 0
                )
                const maxProgress = team.members.length * 90
                const teamPercentage = maxProgress > 0 
                  ? Math.round((teamProgress / maxProgress) * 100) 
                  : 0

                return (
                  <Card key={team.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {team.name}
                            {team.role === "team_lead" && (
                              <Crown className="h-4 w-4 text-signal-s" />
                            )}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {team.description || `${team.members.length} members`}
                          </CardDescription>
                        </div>
                        <Badge variant={team.role === "team_lead" ? "default" : "secondary"}>
                          {team.role === "team_lead" ? "Lead" : "Member"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Team Progress */}
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Team Progress</span>
                          <span className="font-medium">{teamPercentage}%</span>
                        </div>
                        <Progress value={teamPercentage} className="h-2" />
                      </div>

                      {/* Members */}
                      <div className="space-y-3">
                        <p className="text-sm font-medium">Members</p>
                        {team.members.slice(0, 4).map(member => {
                          const memberCompleted = member.progress.filter(p => p.completed).length
                          const memberPercentage = Math.round((memberCompleted / 90) * 100)
                          
                          return (
                            <div key={member.id} className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={member.avatar_url || undefined} />
                                <AvatarFallback className="text-xs">
                                  {member.full_name?.split(" ").map(n => n[0]).join("") || "?"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium truncate">
                                    {member.full_name || member.email}
                                  </p>
                                  {member.teamRole === "team_lead" && (
                                    <Crown className="h-3 w-3 text-signal-s" />
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Progress value={memberPercentage} className="h-1.5 flex-1" />
                                  <span className="text-xs text-muted-foreground w-8">
                                    {memberPercentage}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                        {team.members.length > 4 && (
                          <p className="text-xs text-muted-foreground">
                            +{team.members.length - 4} more members
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      {team.role === "team_lead" && (
                        <div className="flex gap-2 pt-2">
                          <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Invite
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                            <Settings className="mr-2 h-4 w-4" />
                            Manage
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                <h2 className="text-xl font-bold mb-2">No Teams Yet</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Join or create a leadership pod to connect with other leaders and track progress together.
                </p>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Team
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Global Leaderboard</CardTitle>
              <CardDescription>
                Top performers across all leadership pods
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboard.map((member, index) => {
                  const isCurrentUser = member.id === user.id
                  
                  return (
                    <div 
                      key={member.id} 
                      className={cn(
                        "flex items-center gap-4 p-3 rounded-lg transition-colors",
                        isCurrentUser && "bg-accent/10 border border-accent/20",
                        index < 3 && "bg-muted/50"
                      )}
                    >
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold",
                        index === 0 ? "bg-signal-s text-white" :
                        index === 1 ? "bg-signal-g text-white" :
                        index === 2 ? "bg-signal-n text-white" :
                        "bg-muted text-muted-foreground"
                      )}>
                        {index + 1}
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.avatar_url || undefined} />
                        <AvatarFallback>
                          {member.full_name?.split(" ").map(n => n[0]).join("") || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {member.full_name || member.email}
                          {isCurrentUser && " (You)"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {member.title || "Leader"} {member.company && `at ${member.company}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{member.totalPoints}</p>
                        <p className="text-xs text-muted-foreground">points</p>
                      </div>
                      <div className="text-right hidden sm:block">
                        <p className="text-lg font-bold">{member.completedDays}</p>
                        <p className="text-xs text-muted-foreground">days</p>
                      </div>
                    </div>
                  )
                })}
                {leaderboard.length === 0 && (
                  <div className="text-center py-12">
                    <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium">No leaderboard data yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Complete lessons to appear on the leaderboard
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
