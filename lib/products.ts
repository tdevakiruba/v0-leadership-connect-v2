export interface Product {
  id: string
  name: string
  tier: string
  description: string
  priceInCents: number | null // null = "Call for pricing"
  originalPriceInCents?: number // for showing strikethrough price
  duration: number // in days
  features: string[]
  isPopular?: boolean
  ctaType: 'purchase' | 'contact'
}

// Leadership Reboot subscription products
export const PRODUCTS: Product[] = [
  {
    id: 'self-paced',
    name: 'Self-Paced',
    tier: 'Individual',
    description: 'Leadership Reboot SIGNAL™ - 90 Days',
    priceInCents: 100, // $1.00 (test price - change to 19900 for production)
    originalPriceInCents: 29900, // $299.00
    duration: 90,
    features: [
      'Self-paced 90-day curriculum',
      'Daily SIGNAL™ reflections',
      'Mindset Shift leadership actions',
      'Weekly Office Hours (40 min)',
      'Monthly Virtual Keynotes',
      'Community Forum access',
      'Completion Certificate + Digital Credential',
    ],
    ctaType: 'purchase',
  },
  {
    id: 'team-cohort',
    name: 'Leadership Team Cohort™',
    tier: 'Teams',
    description: 'For 5-15 leaders',
    priceInCents: null,
    duration: 90,
    features: [
      'Everything in Self-Paced, plus:',
      'Weekly Online cohort facilitation',
      'Team scenario labs',
      'Manager dashboards',
      'Completion Certificate + Digital Credential',
      'Priority support',
    ],
    isPopular: true,
    ctaType: 'contact',
  },
  {
    id: 'enterprise',
    name: 'Enterprise License',
    tier: 'Enterprise',
    description: 'Unlimited or seat-based access',
    priceInCents: null,
    duration: 365,
    features: [
      'Everything in Team Cohort, plus:',
      'Identity-managed SSO (Google/Microsoft/SAML/OIDC)',
      'Manager roll-up dashboards',
      'Performance analytics',
      'Certificate completion tracking',
      'Concierge support',
    ],
    ctaType: 'contact',
  },
]

// Tax rate as a decimal (e.g., 0.08 = 8%). Set to 0 for no tax.
export const TAX_RATE = 0

export function calculateOrderTotal(priceInCents: number) {
  const subtotal = priceInCents
  const tax = Math.round(subtotal * TAX_RATE)
  const total = subtotal + tax
  return { subtotal, tax, total }
}

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find(p => p.id === id)
}

export function getPurchasableProducts(): Product[] {
  return PRODUCTS.filter(p => p.ctaType === 'purchase')
}
