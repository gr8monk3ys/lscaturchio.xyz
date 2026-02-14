"use client"

import { usePathname } from 'next/navigation'
import { Suspense } from 'react'
import { ContactCTA } from "@/components/ui/contact-cta"
import { ErrorBoundary } from "@/components/ErrorBoundary"

const CONTACT_CTA_EXCLUDED_PATHS = new Set<string>([
  "/chat",
  "/contact",
  "/services",
]);

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isBlogPage = pathname?.startsWith('/blog')
  const isHomePage = pathname === '/'
  const isExcluded = pathname ? CONTACT_CTA_EXCLUDED_PATHS.has(pathname) : false

  return (
    <>
      <main id="main-content">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>

      {!isBlogPage && !isHomePage && !isExcluded && (
        <Suspense fallback={<div className="min-h-[200px]"></div>}>
          <ContactCTA />
        </Suspense>
      )}
    </>
  )
}
