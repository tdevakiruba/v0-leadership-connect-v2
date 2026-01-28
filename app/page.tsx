import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { OAuthHandler } from "@/components/auth/oauth-handler"
import { 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Users, 
  Award,
  Calendar,
  Brain,
  TrendingUp,
  Shield
} from "lucide-react"

const features = [
  {
    icon: Calendar,
    title: "90-Day Curriculum",
    description: "A structured daily program with micro-content, reflection prompts, and actionable leadership exercises."
  },
  {
    icon: Brain,
    title: "SIGNAL\u2122 Framework",
    description: "Our proprietary methodology covering Self-awareness, Interpretation, Goals, Navigation, Action, and Leadership identity."
  },
  {
    icon: Users,
    title: "Leadership Pods",
    description: "Connect with other senior leaders, share insights, and track team progress together."
  },
  {
    icon: Award,
    title: "Certifications",
    description: "Earn phase certificates and your SIGNAL\u2122 Leadership Certification upon completion."
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description: "Visual dashboards, streak tracking, and gamification to keep you motivated."
  },
  {
    icon: Shield,
    title: "Enterprise Ready",
    description: "SSO integration, team management, and scalable deployment for organizations."
  }
]

const phases = [
  { letter: "S", name: "Self-Awareness", days: "1-15", description: "Understand your mental patterns and leadership triggers" },
  { letter: "I", name: "Interpretation", days: "16-30", description: "Reframe challenges as opportunities for growth" },
  { letter: "G", name: "Goals & Strategy", days: "31-45", description: "Align vision with actionable strategic intent" },
  { letter: "N", name: "Navigation", days: "46-60", description: "Lead through complexity and organizational change" },
  { letter: "A", name: "Action & Execution", days: "61-75", description: "Drive results with decisive leadership action" },
  { letter: "L", name: "Leadership Identity", days: "76-90", description: "Cement your evolved leadership presence" },
]

const leaders = [
  "Satya Nadella", "Jensen Huang", "Karen Lynch", 
  "Jamie Dimon", "Mary Barra", "Sundar Pichai"
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* OAuth Handler - catches code parameter from SSO redirect */}
      <Suspense fallback={null}>
        <OAuthHandler />
      </Suspense>
      
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/reboot-logo.png" 
              alt="Leadership Reboot" 
              width={36} 
              height={36}
              className="rounded-lg"
            />
            <span className="font-semibold">Leadership Reboot</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#signal" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              SIGNAL&#8482; Model
            </Link>
            <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button size="sm">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/hero-background.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
        <div className="container mx-auto px-4 py-24 lg:py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6">
              <Zap className="mr-1 h-3 w-3" />
              90-Day Leadership Transformation
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-balance mb-6">
              Transform How You
              <span className="text-primary"> Think, Behave, and Influence</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 text-pretty">
              Leadership Reboot SIGNAL™ is a 90-day guided system that uses the SIGNAL&#8482; framework, 
              micro-content, daily reflection, and performance-aligned action to elevate 
              senior executives and top industry leaders. Designed to take the mindset shifts we discover in our workshops and turn them into permanent habits. Think of the workshop as the spark that lights the fire, and the Leadership Reboot SIGNAL™ as the fuel that keeps it burning for the long haul.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/sign-up">
                <Button size="lg" className="w-full sm:w-auto">
                  Begin Your Transformation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#signal">
              <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                Explore the SIGNAL&#8482; Model
              </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              Join leaders from Fortune 500 companies. No credit card required.
            </p>
          </div>
        </div>
      </section>

      {/* Leader Examples */}
      <section className="border-y bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-sm text-muted-foreground mb-4">
            Learn from insights inspired by world-class leaders
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {leaders.map(leader => (
              <span key={leader} className="text-sm font-medium text-muted-foreground">
                {leader}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4">Features</Badge>
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Everything You Need to Level Up Your Leadership
            </h2>
            <p className="text-muted-foreground">
              A comprehensive platform designed for busy executives who want 
              meaningful transformation without endless workshops.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-sm bg-card/50">
                <CardContent className="pt-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SIGNAL Model Section */}
      <section id="signal" className="py-24 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/signal-background.png')" }}
        />
        <div className="absolute inset-0 bg-background/60" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4">The SIGNAL&#8482; Model</Badge>
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              A Proven Framework for Leadership Excellence
            </h2>
            <p className="text-muted-foreground">
              Six phases, 90 days, one transformation. Each phase builds on the previous, 
              creating lasting change in how you lead.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="grid gap-0 border rounded-xl overflow-hidden bg-card shadow-sm">
              {phases.map((phase, index) => (
                <div 
                  key={phase.letter} 
                  className={`flex items-center gap-6 p-6 ${index !== phases.length - 1 ? 'border-b' : ''}`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary text-xl font-bold shrink-0">
                    {phase.letter}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-foreground">{phase.name}</h3>
                      <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        Days {phase.days}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{phase.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4">How It Works</Badge>
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Your Daily Leadership Practice
            </h2>
            <p className="text-muted-foreground">
              Just 10-15 minutes per day to transform your leadership impact.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            {[
              { step: "1", title: "Read", desc: "Start with a leadership insight from a world-class leader" },
              { step: "2", title: "Reflect", desc: "Apply the thought exercise to your current challenges" },
              { step: "3", title: "Act", desc: "Complete your daily action to change your mindset and track your progress" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4">Pricing</Badge>
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Choose Your Leadership Journey
            </h2>
            <p className="text-muted-foreground">
              Whether you are an individual leader or transforming an entire organization, 
              we have a path for you.
            </p>
          </div>
          <div className="grid gap-8 lg:grid-cols-3 max-w-6xl mx-auto">
            {/* Self-Paced Tier */}
            <Card className="relative flex flex-col">
              <CardContent className="flex flex-col flex-1 pt-6">
                <div className="mb-6">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Individual</p>
                  <h3 className="text-xl font-bold mb-2">Self-Paced</h3>
                  <p className="text-sm text-muted-foreground">
                    Leadership Reboot SIGNAL&#8482; - 90 Days
                  </p>
                </div>
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">$199</span>
                    <span className="text-lg text-muted-foreground line-through">$299</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">one-time payment</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    "Self-paced 90-day curriculum",
                    "Daily SIGNAL\u2122 reflections",
                    "Mindset Shift leadership actions",
                    "Weekly Office Hours (40 min)",
                    "Monthly Virtual Keynotes",
                    "Community Forum access",
                    "Completion Certificate + Digital Credential"
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/auth/sign-up" className="mt-auto">
                  <Button variant="outline" className="w-full bg-transparent">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Team Pack Tier */}
            <Card className="relative flex flex-col border-primary shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
              </div>
              <CardContent className="flex flex-col flex-1 pt-6">
                <div className="mb-6">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Teams</p>
                  <h3 className="text-xl font-bold mb-2">Leadership Team Cohort&#8482;</h3>
                  <p className="text-sm text-muted-foreground">
                    For 5-15 leaders
                  </p>
                </div>
                <div className="mb-6">
                  <span className="text-xl font-bold">Call for pricing</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    "Everything in Self-Paced, plus:",
                    "Weekly Online cohort facilitation",
                    "Team scenario labs",
                    "Manager dashboards",
                    "Completion Certificate + Digital Credential",
                    "Priority support"
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/auth/sign-up" className="mt-auto">
                  <Button className="w-full">
                    Contact Sales
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Enterprise Tier */}
            <Card className="relative flex flex-col">
              <CardContent className="flex flex-col flex-1 pt-6">
                <div className="mb-6">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Enterprise</p>
                  <h3 className="text-xl font-bold mb-2">Enterprise License</h3>
                  <p className="text-sm text-muted-foreground">
                    Unlimited or seat-based access
                  </p>
                </div>
                <div className="mb-6">
                  <span className="text-xl font-bold">Connect for pricing</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    "Everything in Team Cohort, plus:",
                    "Identity-managed SSO (Google/Microsoft/SAML/OIDC)",
                    "Manager roll-up dashboards",
                    "Performance analytics",
                    "Certificate completion tracking",
                    "Concierge support"
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/auth/sign-up" className="mt-auto">
                  <Button variant="outline" className="w-full bg-transparent">
                    Contact Sales
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Ready to Reboot Your Leadership?
          </h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
            Join thousands of senior leaders who have transformed their leadership 
            presence with the SIGNAL&#8482; framework.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/sign-up">
              <Button size="lg" variant="secondary">
                Start Your 90-Day Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-primary-foreground/70">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Free trial
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              No credit card
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Cancel anytime
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Image 
                src="/reboot-logo.png" 
                alt="Leadership Reboot" 
                width={32} 
                height={32}
                className="rounded-lg"
              />
              <span className="font-semibold">Leadership Reboot</span>
            </Link>
            <nav className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Contact</Link>
            </nav>
            <p className="text-sm text-muted-foreground">
              2026 Leadership Reboot. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
