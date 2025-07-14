import "./globals.css"
import { Space_Mono } from 'next/font/google'
import { Footer } from "@/components/ui/footer-section";
import { Navbar } from "@/components/ui/navbar";
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { ContactCTA } from "@/components/ui/contact-cta"
import { MobileNavbar } from "@/components/ui/mobile-navbar"
import Script from 'next/script'
import { Suspense } from 'react'
import { ThemeProviderClient } from "@/components/theme/ThemeProviderClient"
import { ClientLayout } from "@/components/layout/ClientLayout"
import { Toaster } from "@/components/ui/toaster";
import { CookieConsent } from "@/components/ui/cookie-consent";
import { CommandPalette } from "@/components/ui/command-palette";

// Initialize Space Mono font
const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-space-mono',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}): JSX.Element {
  // Server component can't use usePathname() here
  // We'll determine the path in client components that need it

  return (
    <html lang="en" suppressHydrationWarning className={spaceMono.variable}>
      <head>
        {/* No scripts in head that could cause UI issues */}
      </head>
      <body className="font-space-mono antialiased bg-stone-50 dark:bg-stone-900 text-stone-800 dark:text-stone-100">
        {/* Google AdSense script removed as part of cleanup */}
        <ThemeProviderClient>
          <ClientLayout>
            {children}
          </ClientLayout>
        </ThemeProviderClient>
        <Analytics />
        <SpeedInsights />
        <Toaster />
        <CookieConsent />
        <CommandPalette />
      </body>
    </html>
  )
}
