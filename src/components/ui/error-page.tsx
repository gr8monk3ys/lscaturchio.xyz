'use client'

import { useEffect, type ReactNode } from 'react'
import Link from 'next/link'
import { logError } from '@/lib/logger'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
  title?: string
  description?: string
  icon?: ReactNode
  homeLabel?: string
}

/**
 * Shared error boundary UI.
 *
 * Used by route-level error.tsx files to avoid duplicating the same markup.
 * Each page passes a custom title, description, and optional icon while the
 * layout, dev-mode error details, and action buttons stay consistent.
 */
export function ErrorPage({
  error,
  reset,
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again or return to the homepage.',
  icon,
  homeLabel = 'Go home',
}: ErrorPageProps) {
  useEffect(() => {
    logError(title, error, { digest: error.digest })
  }, [error, title])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12">
      <div className="neu-card rounded-2xl p-8 sm:p-12 max-w-md w-full text-center">
        {/* Error icon */}
        <div className="mb-6 flex justify-center">
          <div className="neu-pressed rounded-full p-4">
            {icon ?? (
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            )}
          </div>
        </div>

        {/* Error message */}
        <h1 className="text-section-title mb-3">{title}</h1>
        <p className="text-description mb-6">{description}</p>

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
            className="cta-primary px-6 py-3 rounded-xl focus-ring"
          >
            Try again
          </button>
          <Link
            href="/"
            className="cta-secondary px-6 py-3 rounded-xl font-medium focus-ring"
          >
            {homeLabel}
          </Link>
        </div>
      </div>
    </div>
  )
}
