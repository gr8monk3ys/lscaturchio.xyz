"use client"

import { usePathname } from 'next/navigation'
import { Suspense } from 'react'
import { ContactCTA } from "@/components/ui/contact-cta"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion"

const CONTACT_CTA_EXCLUDED_PATHS = new Set<string>([
  "/chat",
  "/contact",
  "/services",
]);

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()
  const isBlogPage = pathname?.startsWith('/blog')
  const isHomePage = pathname === '/'
  const isExcluded = pathname ? CONTACT_CTA_EXCLUDED_PATHS.has(pathname) : false

  return (
    <>
      <main id="main-content">
        <ErrorBoundary>
          {reduceMotion ? (
            children
          ) : (
            <LayoutGroup id="route">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={pathname}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  style={{ willChange: "auto" }}
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </LayoutGroup>
          )}
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
