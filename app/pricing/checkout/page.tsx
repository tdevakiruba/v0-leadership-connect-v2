import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PRODUCTS } from "@/lib/products"
import { Checkout } from "@/components/checkout"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Shield, Sparkles } from "lucide-react"

interface CheckoutPageProps {
  searchParams: Promise<{ product?: string }>
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?redirect=/pricing")
  }

  const productId = params.product || "self-paced"
  const product = PRODUCTS.find(p => p.id === productId)

  // Only purchasable products can go through checkout
  if (!product || product.ctaType !== 'purchase' || product.priceInCents === null) {
    redirect("/pricing")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-signal-s-light/20">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/pricing" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to Pricing</span>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/reboot-logo.png"
              alt="Leadership Reboot"
              width={32}
              height={32}
              className="rounded-md"
            />
            <span className="font-semibold text-foreground text-sm hidden sm:inline">Leadership Reboot</span>
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-signal-s" />
            <span className="text-sm text-muted-foreground">Secure Checkout</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Order Summary */}
            <div className="lg:col-span-2">
              <div className="sticky top-24">
                <div className="bg-white rounded-2xl border p-6 shadow-sm">
                  <h2 className="font-bold text-lg mb-4">Order Summary</h2>
                  
                  <div className="flex items-start gap-4 pb-4 border-b">
                    <div className="h-12 w-12 rounded-xl bg-signal-s-light flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-signal-s" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.duration} days access</p>
                    </div>
                  </div>

                  <div className="py-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${(product.priceInCents / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span>$0.00</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-signal-s">${(product.priceInCents / 100).toFixed(2)}</span>
                  </div>

                  <div className="mt-6 p-4 bg-slate-50 rounded-xl">
                    <p className="text-xs text-muted-foreground text-center">
                      By completing this purchase, you agree to our Terms of Service and Privacy Policy.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Checkout Form */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="p-6 border-b">
                  <h2 className="font-bold text-lg">Payment Details</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Complete your purchase securely with Stripe
                  </p>
                </div>
                <Checkout productId={productId} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
