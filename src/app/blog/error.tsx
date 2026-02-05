'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { logError } from '@/lib/logger'

/**
 * Error boundary for blog pages.
 * Catches errors when loading blog posts or the blog listing.
 */
export default function BlogError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logError('Blog error', error, { component: 'blog-error-boundary', digest: error.digest })
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
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
          </div>
        </div>

        {/* Error message */}
        <h1 className="text-section-title mb-3">Failed to load blog</h1>
        <p className="text-description mb-6">
          We couldn&apos;t load the blog content. Please try again or browse other sections.
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
            className="cta-primary px-6 py-3 rounded-xl focus-ring"
          >
            Try again
          </button>
          <Link
            href="/"
            className="cta-secondary px-6 py-3 rounded-xl font-medium focus-ring"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}
