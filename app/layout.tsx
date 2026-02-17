import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const _inter = Inter({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Leadership Reboot | 90-Day Executive Transformation',
  description: 'Leadership Reboot SIGNAL™ is a 90-day guided transformation system built for mid-career leaders, emerging executives, and high performers shifting from domain expertise into people, strategy, and solution leadership. Using the SIGNAL™ framework, micro-learning, daily reflection, and performance-aligned action, this experience rewires how leaders interpret pressure, navigate complexity, and make decisions that move teams forward.',
  keywords: ['leadership', 'executive coaching', 'SIGNAL™ model', 'leadership development', 'management training'],
    generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: '#1e3a5f',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  console.log("[v0] RootLayout rendering successfully")
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <Toaster position="top-center" richColors />
        <Analytics />
      </body>
    </html>
  )
}
