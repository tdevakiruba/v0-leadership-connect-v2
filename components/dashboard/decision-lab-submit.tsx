"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  FlaskConical, 
  Send, 
  CheckCircle2, 
  Clock, 
  MessageSquare,
  HelpCircle,
  Lightbulb,
  Calendar,
  ExternalLink,
  Loader2,
  Plus
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { User } from "@supabase/supabase-js"

interface Question {
  id: string
  title: string
  scenario: string
  category: string
  status: "pending" | "addressed" | "scheduled"
  created_at: string
}

interface OfficeHours {
  id: string
  title: string
  scheduled_at: string
  meeting_url: string
  description: string | null
  status: "upcoming" | "completed" | "cancelled"
}

interface DecisionLabSubmitProps {
  user: User
  profile: {
    id: string
    full_name: string | null
  } | null
}

const categories = [
  { value: "strategic", label: "Strategic Decision", icon: Lightbulb },
  { value: "people", label: "People & Team", icon: MessageSquare },
  { value: "conflict", label: "Conflict Resolution", icon: HelpCircle },
  { value: "change", label: "Change Management", icon: FlaskConical },
]

export function DecisionLabSubmit({ user, profile }: DecisionLabSubmitProps) {
  const [title, setTitle] = useState("")
  const [scenario, setScenario] = useState("")
  const [category, setCategory] = useState("strategic")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [myQuestions, setMyQuestions] = useState<Question[]>([])
  const [nextOfficeHours, setNextOfficeHours] = useState<OfficeHours | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  // Fetch user's questions and next office hours
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      
      // Fetch user's submitted questions
      const { data: questions } = await supabase
        .from("leader_questions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5)
      
      if (questions) {
        setMyQuestions(questions)
      }

      // Fetch next office hours
      const { data: officeHours } = await supabase
        .from("office_hours")
        .select("*")
        .eq("status", "upcoming")
        .gte("scheduled_at", new Date().toISOString())
        .order("scheduled_at", { ascending: true })
        .limit(1)
        .single()
      
      if (officeHours) {
        setNextOfficeHours(officeHours)
      }

      setIsLoading(false)
    }

    fetchData()
  }, [user.id, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !scenario.trim()) {
      toast.error("Please fill in all fields")
      return
    }

    setIsSubmitting(true)

    try {
      const { data, error } = await supabase
        .from("leader_questions")
        .insert({
          user_id: user.id,
          title: title.trim(),
          scenario: scenario.trim(),
          category,
          status: "pending"
        })
        .select()
        .single()

      if (error) throw error

      toast.success("Your scenario has been submitted for the next office hours!")
      setTitle("")
      setScenario("")
      setCategory("strategic")
      
      // Add to local list
      if (data) {
        setMyQuestions(prev => [data, ...prev].slice(0, 5))
      }
    } catch (error) {
      console.error("Error submitting question:", error)
      toast.error("Failed to submit. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "addressed":
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-signal-g-light text-signal-g">Addressed</span>
      case "scheduled":
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-signal-s-light text-signal-s">Scheduled</span>
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground">Pending</span>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight section-title-executive">Decision Lab</h1>
        <p className="text-muted-foreground mt-1">
          Submit challenging scenarios and leadership dilemmas for expert guidance during office hours
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Submission Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Next Office Hours Banner */}
          {nextOfficeHours && (
            <Card className="bg-gradient-to-r from-signal-s-light to-signal-n-light border-signal-s/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-signal-s rounded-xl text-white">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-signal-s">Next Office Hours</p>
                      <p className="text-lg font-bold text-foreground">{nextOfficeHours.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(nextOfficeHours.scheduled_at).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>
                  </div>
                  {nextOfficeHours.meeting_url && (
                    <a
                      href={nextOfficeHours.meeting_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-executive text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 text-sm"
                    >
                      Join Meeting
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submission Form */}
          <Card className="card-executive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-bold">
                <FlaskConical className="h-5 w-5 text-signal-s" />
                Submit a Leadership Scenario
              </CardTitle>
              <CardDescription>
                Share a real challenge you&apos;re facing. Your scenario will be discussed during the next office hours session.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Category Selection */}
                <div>
                  <Label className="text-sm font-semibold mb-3 block">Category</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {categories.map((cat) => {
                      const Icon = cat.icon
                      return (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => setCategory(cat.value)}
                          className={cn(
                            "p-3 rounded-xl border-2 transition-all text-left",
                            category === cat.value
                              ? "border-signal-s bg-signal-s-light"
                              : "border-border hover:border-signal-s/30 hover:bg-muted/50"
                          )}
                        >
                          <Icon className={cn(
                            "h-5 w-5 mb-2",
                            category === cat.value ? "text-signal-s" : "text-muted-foreground"
                          )} />
                          <p className={cn(
                            "text-xs font-medium",
                            category === cat.value ? "text-signal-s" : "text-foreground"
                          )}>
                            {cat.label}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <Label htmlFor="title" className="text-sm font-semibold">
                    Brief Title
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Handling resistance to a new initiative"
                    className="mt-2"
                    maxLength={100}
                  />
                </div>

                {/* Scenario */}
                <div>
                  <Label htmlFor="scenario" className="text-sm font-semibold">
                    Describe Your Scenario
                  </Label>
                  <Textarea
                    id="scenario"
                    value={scenario}
                    onChange={(e) => setScenario(e.target.value)}
                    placeholder="Provide context about the situation, the stakeholders involved, what you've tried, and what outcome you're hoping for..."
                    className="mt-2 min-h-[160px]"
                    maxLength={2000}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {scenario.length}/2000 characters
                  </p>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !title.trim() || !scenario.trim()}
                  className="btn-executive text-white w-full sm:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit for Office Hours
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - My Submissions */}
        <div className="space-y-6">
          <Card className="card-executive">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Clock className="h-4 w-4 text-signal-n" />
                My Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8 text-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
                </div>
              ) : myQuestions.length > 0 ? (
                <div className="space-y-3">
                  {myQuestions.map((question) => (
                    <div 
                      key={question.id}
                      className="p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm font-medium text-foreground line-clamp-1">
                          {question.title}
                        </p>
                        {getStatusBadge(question.status)}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {question.scenario}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(question.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No submissions yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Submit your first scenario above
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card className="bg-gradient-to-br from-card to-muted/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-signal-i" />
                Submission Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-signal-g mt-0.5 flex-shrink-0" />
                  Be specific about the context and stakeholders
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-signal-g mt-0.5 flex-shrink-0" />
                  Share what you&apos;ve already tried
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-signal-g mt-0.5 flex-shrink-0" />
                  Describe your desired outcome
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-signal-g mt-0.5 flex-shrink-0" />
                  Keep scenarios confidential-safe
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
