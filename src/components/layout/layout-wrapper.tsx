"use client"

import { usePathname } from 'next/navigation'
import { Suspense } from 'react'
import { ContactCTA } from "@/components/ui/contact-cta"
import { ErrorBoundary } from "@/components/ErrorBoundary"

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isBlogPage = pathname?.startsWith('/blog')

  return (
    <>
      <main id="main-content">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>

      {!isBlogPage && (
        <Suspense fallback={<div className="min-h-[200px]"></div>}>
          <ContactCTA />
        </Suspense>
      )}
    </>
  )
}
