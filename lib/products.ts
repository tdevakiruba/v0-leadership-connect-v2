export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  duration: number // in days
  features: string[]
}

// Leadership Reboot subscription products
export const PRODUCTS: Product[] = [
  {
    id: 'leadership-reboot-90',
    name: '90-Day Leadership Reboot',
    description: 'Complete access to the SIGNAL™ leadership transformation program',
    priceInCents: 29700, // $297.00
    duration: 90,
    features: [
      'Full 90-day SIGNAL™ framework access',
      'Daily leadership modules & exercises',
      'AI-powered reflection prompts',
      'Progress tracking & analytics',
      'Decision Lab scenario submissions',
      'Office hours access',
      'Completion certificate',
    ],
  },
]

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find(p => p.id === id)
}
