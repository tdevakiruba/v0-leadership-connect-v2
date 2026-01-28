import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, ArrowRight, Zap } from 'lucide-react'

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">Leadership Reboot</span>
          </div>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1 pb-6 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-accent" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Check your email</CardTitle>
            <CardDescription className="text-muted-foreground">
              We&apos;ve sent you a verification link to complete your registration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="p-4 rounded-lg bg-secondary">
              <p className="text-sm text-secondary-foreground">
                Click the link in your email to verify your account and begin your 90-day leadership transformation journey.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Didn&apos;t receive the email? Check your spam folder or
              </p>
              <Button variant="outline" className="bg-transparent text-foreground">
                Resend verification email
              </Button>
            </div>

            <div className="pt-4 border-t border-border">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-accent hover:text-accent/80">
                  Back to sign in
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
