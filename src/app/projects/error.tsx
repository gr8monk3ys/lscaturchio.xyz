'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { logError } from '@/lib/logger'

/**
 * Error boundary for projects pages.
 * Catches errors when loading project data or the projects listing.
 */
export default function ProjectsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logError('Projects error', error, { component: 'projects-error-boundary', digest: error.digest })
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12">
      <div className="neu-card rounded-2xl p-8 sm:p-12 max-w-md w-full text-center">
        {/* Error icon */}
        <div className="mb-6 flex justify-center">
          <div className="neu-pressed rounded-full p-4">
            <svg
              className="h-8 w-8 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
              />
            </svg>
          </div>
        </div>

        {/* Error message */}
        <h1 className="text-section-title mb-3">Failed to load projects</h1>
        <p className="text-description mb-6">
          We couldn&apos;t load the projects. Please try again or explore other sections.
        </p>

        {/* Error details in development */}
        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="neu-pressed-sm rounded-lg p-3 mb-6 text-left">
            <p className="text-xs font-mono text-muted-foreground break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs font-mono text-muted-foreground mt-1">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="neu-button bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-all focus-ring"
          >
            Try again
          </button>
          <Link
            href="/"
            className="neu-button px-6 py-3 rounded-xl font-medium text-foreground hover:text-primary transition-all focus-ring"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}
