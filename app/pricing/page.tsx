import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PRODUCTS } from "@/lib/products"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Sparkles, Shield, Clock, Users, Award } from "lucide-react"

const features = [
  "90-Day Leadership Transformation Program",
  "Access to all SIGNAL™ Framework modules",
  "Daily leadership frameworks & exercises",
  "Strategic reflection tools",
  "Progress tracking & Leadership Index",
  "Certificate upon completion",
]

interface PricingPageProps {
  searchParams: Promise<{ expired?: string }>
}

export default async function PricingPage({ searchParams }: PricingPageProps) {
  const params = await searchParams
  const isExpired = params.expired === "true"
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Check if user already has an active subscription
  if (user) {
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .gte("end_date", new Date().toISOString().split("T")[0])
      .single()

    if (subscription) {
      redirect("/dashboard")
    }
  }

  const product = PRODUCTS[0] // 90-day program

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-signal-s-light/20">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-signal-s flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl">Leadership Reboot SIGNAL™</span>
          </Link>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Link href="/dashboard">
                <Button variant="outline" size="sm">Dashboard</Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        {/* Renew Subscription Notice */}
        {isExpired && (
          <div className="max-w-2xl mx-auto mb-8 p-4 rounded-xl border border-signal-s/20 bg-signal-s-light/30 flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-signal-s/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-4 w-4 text-signal-s" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Renew Subscription</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your 90-day access has ended. Renew below to continue your leadership transformation journey.
              </p>
            </div>
          </div>
        )}

        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-signal-s-light text-signal-s text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            90-Day Leadership Transformation
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
            <span className="text-foreground">Invest in Your</span>{" "}
            <span className="text-signal-s">Leadership Growth</span>
          </h1>
          <p className="text-lg text-muted-foreground text-balance">
            Join thousands of executives who have transformed their leadership through the SIGNAL™ framework.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="max-w-lg mx-auto">
          <Card className="relative overflow-hidden border-2 border-signal-s/20 shadow-xl">
            {/* Popular badge */}
            <div className="absolute top-0 right-0">
              <div className="bg-signal-s text-white text-xs font-bold px-4 py-1 rounded-bl-lg">
                MOST POPULAR
              </div>
            </div>
            
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl">{product.name}</CardTitle>
              <CardDescription className="text-base">
                {product.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="text-center pb-6">
              <div className="mb-6">
                <span className="text-5xl font-bold">${(product.priceInCents / 100).toFixed(0)}</span>
                <span className="text-muted-foreground ml-2">one-time</span>
              </div>

              {/* Features */}
              <ul className="space-y-3 text-left mb-8">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-signal-s-light flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-signal-s" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Duration highlight */}
              <div className="flex items-center justify-center gap-6 p-4 rounded-xl bg-slate-50 mb-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-signal-s" />
                  <span className="text-sm font-medium">90 Days Access</span>
                </div>
                <div className="h-4 w-px bg-slate-200" />
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-signal-s" />
                  <span className="text-sm font-medium">Certificate Included</span>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col gap-4">
              {user ? (
                <Link href={`/pricing/checkout?product=${product.id}`} className="w-full">
                  <Button className="w-full btn-executive text-white h-12 text-base">
                    Start Your Transformation
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/register" className="w-full">
                  <Button className="w-full btn-executive text-white h-12 text-base">
                    Create Account to Purchase
                  </Button>
                </Link>
              )}
              <p className="text-xs text-center text-muted-foreground">
                Secure payment powered by Stripe. 30-day money-back guarantee.
              </p>
            </CardFooter>
          </Card>
        </div>

        {/* Trust indicators */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-white border">
            <Shield className="h-8 w-8 text-signal-s" />
            <div>
              <p className="font-medium text-sm">Secure Payment</p>
              <p className="text-xs text-muted-foreground">256-bit SSL encryption</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-white border">
            <Clock className="h-8 w-8 text-signal-g" />
            <div>
              <p className="font-medium text-sm">Instant Access</p>
              <p className="text-xs text-muted-foreground">Start immediately</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-white border">
            <Users className="h-8 w-8 text-signal-n" />
            <div>
              <p className="font-medium text-sm">5,000+ Leaders</p>
              <p className="text-xs text-muted-foreground">Trusted by executives</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
