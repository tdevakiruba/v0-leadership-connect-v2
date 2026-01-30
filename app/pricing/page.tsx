import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PRODUCTS } from "@/lib/products"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Check, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-signal-s-light/10">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image 
              src="/images/reboot-logo.png" 
              alt="Leadership Reboot" 
              width={40} 
              height={40}
              className="rounded-full"
            />
            <span className="font-bold text-xl text-[#0f2a4a]">Leadership Reboot SIGNAL™</span>
          </Link>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:block">{user.email}</span>
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
                <Button size="sm" className="bg-[#0f2a4a] hover:bg-[#0f2a4a]/90">Get Started</Button>
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
            Leadership Transformation Programs
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
            <span className="text-foreground">Choose the right</span>{" "}
            <span className="text-signal-s">path for you.</span>
          </h1>
          <p className="text-lg text-muted-foreground text-balance">
            Transform your leadership through the SIGNAL™ framework with individual, team, or enterprise options.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {PRODUCTS.map((product) => (
            <Card 
              key={product.id}
              className={cn(
                "relative flex flex-col",
                product.isPopular 
                  ? "border-2 border-[#0f2a4a] shadow-xl" 
                  : "border border-slate-200"
              )}
            >
              {/* Popular badge */}
              {product.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-[#0f2a4a] text-white text-xs font-semibold px-4 py-1.5 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              
              <CardHeader className="pb-4 pt-8">
                <p className="text-sm text-muted-foreground">{product.tier}</p>
                <h3 className="text-xl font-bold text-foreground">{product.name}</h3>
                <p className="text-sm text-muted-foreground">{product.description}</p>
              </CardHeader>
              
              <CardContent className="flex-1">
                {/* Price */}
                <div className="mb-6">
                  {product.priceInCents !== null ? (
                    <>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold">${(product.priceInCents / 100).toFixed(0)}</span>
                        {product.originalPriceInCents && (
                          <span className="text-lg text-muted-foreground line-through">
                            ${(product.originalPriceInCents / 100).toFixed(0)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">one-time payment</p>
                    </>
                  ) : (
                    <p className="text-2xl font-bold">Call for pricing</p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded-full border border-signal-s flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="h-3 w-3 text-signal-s" />
                      </div>
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter className="pt-6">
                {product.ctaType === 'purchase' ? (
                  user ? (
                    <Link href={`/pricing/checkout?product=${product.id}`} className="w-full">
                      <Button 
                        variant="outline" 
                        className="w-full h-12 text-base font-semibold"
                      >
                        Get Started
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/auth/register" className="w-full">
                      <Button 
                        variant="outline" 
                        className="w-full h-12 text-base font-semibold"
                      >
                        Get Started
                      </Button>
                    </Link>
                  )
                ) : (
                  <Link href="mailto:hello@leadershipreboot.com?subject=Inquiry about Leadership Reboot" className="w-full">
                    <Button 
                      className={cn(
                        "w-full h-12 text-base font-semibold",
                        product.isPopular 
                          ? "bg-[#0f2a4a] hover:bg-[#0f2a4a]/90 text-white" 
                          : "bg-white text-foreground border border-slate-300 hover:bg-slate-50"
                      )}
                      variant={product.isPopular ? "default" : "outline"}
                    >
                      Contact Sales
                    </Button>
                  </Link>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Trust message */}
        <p className="text-center text-sm text-muted-foreground mt-12">
          Secure payment powered by Stripe. 30-day money-back guarantee on all paid plans.
        </p>
      </main>
    </div>
  )
}
