"use client"

import "./globals.css"
import { Footer } from "@/components/ui/footer-section";
import { Navbar } from "@/components/ui/navbar";
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { ContactCTA } from "@/components/ui/contact-cta"
import { MobileNavbar } from "@/components/ui/mobile-navbar"
import { usePathname } from 'next/navigation'
import Script from 'next/script'
import Head from 'next/head'
import { Suspense } from 'react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isBlogPage = pathname?.startsWith('/blog')
  const canonicalUrl = `https://lscaturchio.xyz${pathname || ''}`

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* DNS Prefetch & Preconnect for External Resources */}
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossOrigin="anonymous" />
        
        {/* Preload Critical Resources */}
        <link rel="preload" href="/images/portrait.jpg" as="image" />
        <link rel="preload" href="/fonts/CalSans-SemiBold.woff2" as="font" crossOrigin="anonymous" />
        
        {/* Canonical Link */}
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Core Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="theme-color" content="#ffffff" />
        
        {/* Performance Hints */}
        <link rel="preconnect" href="https://vitals.vercel-insights.com" />
        
        {/* Google AdSense Script - Load with Lower Priority */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4505962980988232"
          crossOrigin="anonymous"
          strategy="lazyOnload"
          id="google-adsense"
        />
        
        {/* Resource Hints */}
        <link rel="modulepreload" href="/_next/static/chunks/main.js" />
        
        {/* Additional Media Query Support */}
        <style jsx global>{`
          @media (max-width: 640px) {
            .mobile-optimized {
              padding: 1rem;
            }
          }
          @media (min-width: 641px) and (max-width: 1024px) {
            .tablet-optimized {
              padding: 1.5rem;
            }
          }
          @media (min-width: 1025px) {
            .desktop-optimized {
              padding: 2rem;
            }
          }
          
          /* Performance Optimization - Content-visibility */
          .content-visibility-auto {
            content-visibility: auto;
            contain-intrinsic-size: 1px 5000px;
          }
          
          /* Prevent Layout Shifts */
          img, picture, video, canvas, svg {
            display: block;
            max-width: 100%;
            height: auto;
          }
          
          /* Improved Font Display */
          @font-face {
            font-family: 'CalSans';
            font-display: swap;
            src: url('/fonts/CalSans-SemiBold.woff2') format('woff2');
          }
        `}</style>
      </head>
      <body>
        <Suspense fallback={<div className="min-h-[64px]"></div>}>
          <Navbar />
        </Suspense>
        <Suspense fallback={<div className="min-h-[64px] md:hidden"></div>}>
          <MobileNavbar />
        </Suspense>
        
        <main>
          {children}
        </main>
        
        {!isBlogPage && (
          <Suspense fallback={<div className="min-h-[200px]"></div>}>
            <ContactCTA />
          </Suspense>
        )}
        
        <Suspense fallback={<div className="min-h-[200px]"></div>}>
          <Footer />
        </Suspense>
        
        {/* Load analytics with low priority */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
