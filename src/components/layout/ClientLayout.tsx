// Rule: TypeScript Usage - Use TypeScript for all code
"use client"

import { usePathname } from 'next/navigation'
import { Suspense } from 'react'
import { Footer } from "@/components/ui/footer-section"
import { Navbar } from "@/components/ui/navbar"
import { ContactCTA } from "@/components/ui/contact-cta"
import { MobileNavbar } from "@/components/ui/mobile-navbar"
import { ThemeToggle } from "@/components/theme/ThemeToggle"
import { SearchDialog } from "@/components/search/SearchDialog"
import { BackToTop } from "@/components/ui/back-to-top"

interface ClientLayoutProps {
  children: React.ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps): JSX.Element {
  const pathname = usePathname()
  const isBlogPage = pathname?.startsWith('/blog')

  return (
    <>
      <Suspense fallback={<div className="min-h-[64px]"></div>}>
        <Navbar>
          <div className="flex items-center space-x-2">
            <SearchDialog />
            <ThemeToggle />
          </div>
        </Navbar>
      </Suspense>
      
      <Suspense fallback={<div className="min-h-[64px] md:hidden"></div>}>
        <MobileNavbar />
      </Suspense>
      
      <main id="main-content">
        {children}
      </main>
      
      {!isBlogPage && (
        <Suspense fallback={<div className="min-h-[200px]"></div>}>
          <ContactCTA />
        </Suspense>
      )}
      
      <Suspense fallback={<div className="min-h-[200px]"></div>}>
        <Footer />
        <BackToTop />
      </Suspense>
    </>
  )
}
