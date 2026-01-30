import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, ArrowRight } from 'lucide-react'

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>
}) {
  const { message } = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center mb-8">
          <Link href="/" className="flex items-center justify-center gap-3 mb-2">
            <Image 
              src="/images/reboot-logo.png" 
              alt="Leadership Reboot" 
              width={40} 
              height={40}
              className="rounded-full"
            />
            <span className="text-xl font-bold text-[#0f2a4a]">Leadership Reboot SIGNAL™</span>
          </Link>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1 pb-6 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Authentication Error</CardTitle>
            <CardDescription className="text-muted-foreground">
              {message || 'Something went wrong during authentication'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="p-4 rounded-lg bg-secondary">
              <p className="text-sm text-secondary-foreground">
                Please try signing in again. If the problem persists, contact support for assistance.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Link href="/auth/login">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Try Again
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full bg-transparent text-foreground">
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
