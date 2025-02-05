"use client"

import "./globals.css"
import { Footer } from "@/components/ui/footer-section";
import { Navbar } from "@/components/ui/navbar";
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { ContactCTA } from "@/components/ui/contact-cta"
import { MobileNavbar } from "@/components/ui/mobile-navbar"
import { usePathname } from 'next/navigation'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isBlogPage = pathname?.startsWith('/blog')

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Navbar />
        <MobileNavbar />
        {children}
        {!isBlogPage && <ContactCTA />}
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
