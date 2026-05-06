import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, CheckCircle2, XCircle, Search, Award, Calendar, User, ShieldCheck } from "lucide-react"

// SIGNAL phases mapping
const phaseInfo: Record<string, { name: string, capability: string, color: string }> = {
  'S': { name: 'Self-Awareness', capability: 'Self-Awareness Mastery', color: 'bg-emerald-500' },
  'I': { name: 'Interpretation', capability: 'Interpretation Excellence', color: 'bg-teal-500' },
  'G': { name: 'Goals & Strategy', capability: 'Strategic Vision', color: 'bg-cyan-500' },
  'N': { name: 'Navigation', capability: 'Navigation Expertise', color: 'bg-blue-500' },
  'A': { name: 'Action & Execution', capability: 'Execution Mastery', color: 'bg-indigo-500' },
  'L': { name: 'Leadership Identity', capability: 'Leadership Identity', color: 'bg-violet-500' },
}

interface VerificationResult {
  valid: boolean
  phase?: string
  phaseName?: string
  capability?: string
  userName?: string
  issueDate?: string
  message?: string
}

async function verifyCertificate(certificateNumber: string): Promise<VerificationResult> {
  // Certificate format: LR-{PHASE}-{TIMESTAMP}-{USER_HASH}
  // Example: LR-S-M2X5KP-ABC12345
  
  if (!certificateNumber || !certificateNumber.startsWith('LR-')) {
    return { valid: false, message: 'Invalid certificate format. Certificate numbers start with "LR-".' }
  }

  const parts = certificateNumber.split('-')
  if (parts.length !== 4) {
    return { valid: false, message: 'Invalid certificate format. Expected format: LR-X-XXXXXX-XXXXXXXX' }
  }

  const [, phase, timestampB36, userHash] = parts

  // Validate phase
  if (!phaseInfo[phase]) {
    return { valid: false, message: `Invalid phase code "${phase}". Valid phases are: S, I, G, N, A, L.` }
  }

  // Decode timestamp
  let issueDate: Date
  try {
    const timestamp = parseInt(timestampB36, 36)
    issueDate = new Date(timestamp)
    
    // Sanity check: date should be reasonable (after 2024, before far future)
    if (issueDate.getFullYear() < 2024 || issueDate.getFullYear() > 2100) {
      return { valid: false, message: 'Invalid certificate timestamp.' }
    }
  } catch {
    return { valid: false, message: 'Invalid certificate timestamp.' }
  }

  // Look up user by the hash prefix of their ID
  const supabase = await createClient()
  
  // Query profiles where the user ID starts with this hash (case-insensitive)
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, full_name')
    .ilike('id', `${userHash.toLowerCase()}%`)
    .limit(1)

  if (error) {
    console.error('[v0] Error querying profiles:', error)
    return { valid: false, message: 'Unable to verify certificate at this time.' }
  }

  if (!profiles || profiles.length === 0) {
    // Certificate format is valid but we can't find the user
    // This could be a legitimate certificate from a deleted account
    // or the hash doesn't match any user
    return {
      valid: true,
      phase,
      phaseName: phaseInfo[phase].name,
      capability: phaseInfo[phase].capability,
      userName: 'Certificate Holder',
      issueDate: issueDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      message: 'Certificate format is valid. User details are not available.'
    }
  }

  const profile = profiles[0]

  // Verify the user has actually completed this phase
  // Check their daily reflections to see if they've completed the required days
  const phaseRequirements: Record<string, number> = {
    'S': 15,  // Days 1-15
    'I': 30,  // Days 16-30
    'G': 45,  // Days 31-45
    'N': 60,  // Days 46-60
    'A': 75,  // Days 61-75
    'L': 90,  // Days 76-90
  }

  const requiredDay = phaseRequirements[phase]
  
  const { count, error: reflectionError } = await supabase
    .from('V2_daily_reflections')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', profile.id)
    .lte('day_number', requiredDay)

  if (reflectionError) {
    console.error('[v0] Error checking reflections:', reflectionError)
  }

  const hasCompleted = count !== null && count >= requiredDay

  return {
    valid: hasCompleted,
    phase,
    phaseName: phaseInfo[phase].name,
    capability: phaseInfo[phase].capability,
    userName: profile.full_name || 'Leadership Professional',
    issueDate: issueDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    message: hasCompleted 
      ? 'This certificate has been verified as authentic.'
      : 'Certificate format is valid but completion could not be verified.'
  }
}

async function VerificationResult({ certificateNumber }: { certificateNumber: string }) {
  const result = await verifyCertificate(certificateNumber)

  return (
    <Card className={`mt-8 border-2 ${result.valid ? 'border-emerald-500/50' : 'border-destructive/50'}`}>
      <CardHeader className="text-center pb-4">
        <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${result.valid ? 'bg-emerald-500/10' : 'bg-destructive/10'}`}>
          {result.valid ? (
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          ) : (
            <XCircle className="h-8 w-8 text-destructive" />
          )}
        </div>
        <CardTitle className={result.valid ? 'text-emerald-500' : 'text-destructive'}>
          {result.valid ? 'Certificate Verified' : 'Verification Failed'}
        </CardTitle>
        <CardDescription>{result.message}</CardDescription>
      </CardHeader>
      
      {result.valid && result.phase && (
        <CardContent className="pt-0">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Certificate Holder</p>
                <p className="font-medium">{result.userName}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Award className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Achievement</p>
                <p className="font-medium">{result.capability}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className={`h-5 w-5 rounded-full ${phaseInfo[result.phase]?.color || 'bg-primary'} flex items-center justify-center`}>
                <span className="text-[10px] font-bold text-white">{result.phase}</span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">SIGNAL Phase</p>
                <p className="font-medium">{result.phaseName}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Issue Date</p>
                <p className="font-medium">{result.issueDate}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-500 mt-0.5" />
              <div>
                <p className="font-medium text-emerald-500">Authenticity Confirmed</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This certificate was issued by Leadership Reboot as part of the 90-Day 
                  SIGNAL Framework program. The certificate holder has demonstrated 
                  commitment to leadership development.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ cert?: string }>
}) {
  const params = await searchParams
  const certificateNumber = params.cert || ''

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/leadership-reboot-logo.png"
              alt="Leadership Reboot SIGNAL Framework"
              width={200}
              height={50}
              className="h-10 w-auto"
            />
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <Badge variant="outline" className="mb-4">
              <ShieldCheck className="mr-2 h-4 w-4" />
              Certificate Verification
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight mb-3">
              Verify a Certificate
            </h1>
            <p className="text-muted-foreground">
              Enter a certificate number to verify its authenticity and view details 
              about the achievement.
            </p>
          </div>

          {/* Search Form */}
          <Card>
            <CardContent className="pt-6">
              <form action="/verify" method="GET" className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    name="cert"
                    placeholder="Enter certificate number (e.g., LR-S-M2X5KP-ABC12345)"
                    defaultValue={certificateNumber}
                    className="pl-10"
                  />
                </div>
                <Button type="submit">Verify</Button>
              </form>
              
              <p className="text-xs text-muted-foreground mt-3">
                Certificate numbers are found at the bottom of each Leadership Reboot certificate.
              </p>
            </CardContent>
          </Card>

          {/* Verification Result */}
          {certificateNumber && (
            <Suspense fallback={
              <Card className="mt-8">
                <CardContent className="py-12 text-center">
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="h-16 w-16 bg-muted rounded-full mb-4" />
                    <div className="h-6 w-48 bg-muted rounded mb-2" />
                    <div className="h-4 w-64 bg-muted rounded" />
                  </div>
                </CardContent>
              </Card>
            }>
              <VerificationResult certificateNumber={certificateNumber} />
            </Suspense>
          )}

          {/* Help Section */}
          <div className="mt-12 text-center">
            <h3 className="font-semibold mb-2">Need Help?</h3>
            <p className="text-sm text-muted-foreground">
              If you have questions about certificate verification or believe there is an error, 
              please contact our support team.
            </p>
            <Button variant="link" className="mt-2" asChild>
              <a href="mailto:support@leadershipreboot.com">Contact Support</a>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Leadership Reboot. All rights reserved.</p>
          <p className="mt-1">SIGNAL Framework | Transformer Hub</p>
        </div>
      </footer>
    </div>
  )
}
