'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { logError } from '@/lib/logger'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logError('Page error', error, { component: 'error-boundary', digest: error.digest })
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          We encountered an unexpected error. Please try again or return to the homepage.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="neu-button bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-all"
          >
            Try again
          </button>
          <Link
            href="/"
            className="neu-button px-6 py-3 rounded-xl font-medium text-foreground hover:text-primary transition-all"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}
