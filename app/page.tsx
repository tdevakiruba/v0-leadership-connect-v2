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
    description: "A structured daily program with <span className=\"font-bold \">micro-content</span>, reflection prompts, and actionable leadership exercises."
  },
  {
    icon: Brain,
    title: "SIGNAL\u2122 Framework",
    description: "Our proprietary methodology covering <span className=\"font-bold \">Self-awareness, Interpretation, Goals, Navigation, Action, and Leadership identity.</span>"
  },
  {
    icon: Users,
    title: "Leadership Pods",
    description: "<span className=\"font-bold \">Connect with other leaders,</span> share insights, and track team progress together."
  },
  {
    icon: Award,
    title: "Certifications",
    description: "Earn phase certificates and your SIGNAL\u2122 Leadership Certification upon completion."
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description: "<span className=\"font-bold \">Visual dashboards</span>, streak tracking, and gamification to keep you motivated."
  },
  {
    icon: Shield,
    title: "Enterprise Ready",
    description: "SSO integration, team management, and scalable deployment for organizations."
  }
]

// SIGNAL™ phases with Monochromatic Blue-Teal Gradient Palette
const phases = [
  { letter: "S", name: "Self-Awareness", days: "1-15", description: "Understand your mental patterns and leadership triggers", bg: "bg-signal-s", bgLight: "bg-signal-s-light", text: "text-signal-s" },
  { letter: "I", name: "Interpretation", days: "16-30", description: "Reframe challenges as opportunities for growth", bg: "bg-signal-i", bgLight: "bg-signal-i-light", text: "text-signal-i" },
  { letter: "G", name: "Goals & Strategy", days: "31-45", description: "Align vision with actionable strategic intent", bg: "bg-signal-g", bgLight: "bg-signal-g-light", text: "text-signal-g" },
  { letter: "N", name: "Navigation", days: "46-60", description: "Lead through complexity and organizational change", bg: "bg-signal-n", bgLight: "bg-signal-n-light", text: "text-signal-n" },
  { letter: "A", name: "Action & Execution", days: "61-75", description: "Drive results with decisive leadership action", bg: "bg-signal-a", bgLight: "bg-signal-a-light", text: "text-signal-a" },
  { letter: "L", name: "Leadership Identity", days: "76-90", description: "Cement your evolved leadership presence", bg: "bg-signal-l", bgLight: "bg-signal-l-light", text: "text-signal-l" },
]

const leaders = [
  "Satya Nadella", "Jensen Huang", "Howard Schultz", "Tim Cook", "Reed Hastings", "Pat Gelsinger", "Ray Dalio", "Bob Iger", "Karen Lynch",
  "Jamie Dimon", "Mary Barra", "Sundar Pichai", "Ginni Rometty", "Jeff Bezos"
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
            <span className="font-semibold">Leadership Reboot SIGNAL™ Framework</span>
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
              <Button size="sm">
                Sign In
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
            <Badge variant="secondary" className="mb-6 text-base px-5 py-2">
              <Zap className="mr-2 h-5 w-5" />
              90-Day Leadership Transformation
            </Badge>
            <br></br>
            <div className="flex justify-center mb-6">
              <Image
                src="/reboot-logo.png"
                alt="Leadership Reboot"
                width={76}
                height={76}
                className="rounded-lg"
              />
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-balance mb-6">
              Leadership Reboot<br></br>
              <span className="text-primary">SIGNAL™ Framework</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto mb-8 text-center">
              Leadership Reboot SIGNAL™ — a 90-day micro-learning leadership transformation designed to help you lead in the age of AI. <span className="font-bold italic">Helping mid-career leaders, emerging executives, and high performers shifting from domain expertise into people, strategy, and solution leadership</span>. Using the SIGNAL™ framework, micro-learning, daily reflection, and performance-aligned action, this experience rewires how leaders interpret pressure, navigate complexity, and make decisions that move teams forward. What begins in our workshops as awareness becomes permanent behavior here. Think of the workshop as the spark. Leadership Reboot SIGNAL™ is the fuel that keeps the fire burning — every day, for the long haul.
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
          <div className="text-center max-w-4xl mx-auto mb-16">
            <Badge variant="outline" className="mb-8 text-base px-5 py-2">Features</Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-balance mb-6">
              Transform How You<br></br>
              <span className="text-primary"> Think, Behave, and Influence</span>
            </h1>
            <p className="text-muted-foreground">
              A comprehensive platform designed for busy executives who want
              meaningful transformation without endless workshops.
            </p>  
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="border bg-card/50 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 hover:-translate-y-0.5">
                <CardContent className="pt-5 pb-4 px-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-3">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1 text-sm">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
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
            <Badge variant="outline" className="mb-4 text-base px-5 py-2">The SIGNAL&#8482; Model</Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-balance mb-6">
              A Proven Framework<br></br>
              <span className="text-primary"> For Leadership Excellence</span>
            </h1>
            <p className="text-muted-foreground">
              Six phases, 90 days, one transformation. Each phase builds on the previous,
              creating lasting change in how you lead.
            </p>
          </div>
          {/* Horizontal Timeline */}
          <div className="max-w-5xl mx-auto">
            <div className="flex items-start justify-between relative px-4 md:px-8">
              {/* Connecting line behind circles */}
              <div className="absolute top-7 left-[calc(8.33%)] right-[calc(8.33%)] h-1 bg-muted rounded-full" aria-hidden="true" />

              {phases.map((phase, index) => (
                <div key={phase.letter} className="flex flex-col items-center relative z-10 flex-1">
                  {/* Circle */}
                  <div className={`flex h-14 w-14 items-center justify-center rounded-full ${phase.bg} text-white text-xl font-bold shadow-lg ring-4 ring-background`}>
                    {phase.letter}
                  </div>
                  {/* Phase name */}
                  <h3 className={`mt-4 font-semibold text-sm ${phase.text} text-center`}>
                    {phase.name}
                  </h3>
                  {/* Days badge */}
                  <span className={`mt-1 text-xs font-medium ${phase.text} ${phase.bgLight} px-2 py-0.5 rounded-full`}>
                    Days {phase.days}
                  </span>
                  {/* Description */}
                  <p className="mt-2 text-xs text-muted-foreground text-center max-w-[120px] leading-relaxed hidden md:block">
                    {phase.description}
                  </p>
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
            <Badge variant="outline" className="mb-4 text-base px-5 py-2">How It Works</Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-balance mb-6">
              Your Daily<br></br>
              <span className="text-primary">Leadership Practice</span>
            </h1>
            <p className="text-muted-foreground">
              Just 10-15 minutes per day to transform your leadership impact.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            {[
              { step: "1", title: "Read", desc: "Start with a leadership insight from a world-class leader", bg: "bg-signal-s", text: "text-signal-s" },
              { step: "2", title: "Reflect", desc: "Apply the thought exercise to your current challenges", bg: "bg-signal-g", text: "text-signal-g" },
              { step: "3", title: "Act", desc: "Complete your daily action to change your mindset and track your progress", bg: "bg-signal-l", text: "text-signal-l" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${item.bg} text-white font-bold text-lg mx-auto mb-4 shadow-md`}>
                  {item.step}
                </div>
                <h3 className={`font-semibold mb-2 ${item.text}`}>{item.title}</h3>
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
            <Badge variant="outline" className="mb-4 text-base px-5 py-2">Pricing</Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-balance mb-6">
              Choose Your<br></br>
              <span className="text-primary">Leadership Journey</span>
            </h1>
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
                    <span className="text-3xl font-bold">$149</span>
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
                  <span className="text-xl font-bold">Call for pricing</span>
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
