'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

/**
 * Global error boundary for handling errors in the root layout.
 * This is a special Next.js component that must render its own <html> and <body> tags.
 * It catches errors that occur during rendering of the root layout.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Report the error to Sentry
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="en">
      <body className="bg-[hsl(0,0%,96%)] dark:bg-[hsl(240,10%,8%)] text-[hsl(240,10%,3.9%)] dark:text-[hsl(0,0%,98%)]">
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <div
            className="max-w-md w-full text-center p-8 sm:p-12 rounded-2xl"
            style={{
              background: 'inherit',
              boxShadow:
                '8px 8px 12px -2px rgba(200, 200, 210, 0.2), -6px -6px 12px -1px rgba(255, 255, 255, 0.85)',
            }}
          >
            {/* Error icon */}
            <div className="mb-6 flex justify-center">
              <div
                className="rounded-full p-4"
                style={{
                  boxShadow:
                    'inset -3px -3px 5px -1px rgba(255, 255, 255, 0.85), inset 2px 2px 6px -1px rgba(200, 200, 210, 0.2)',
                }}
              >
                <svg
                  className="h-8 w-8 text-red-500"
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
              </div>
            </div>

            {/* Error message */}
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-3">
              Something went wrong
            </h1>
            <p className="text-base leading-relaxed opacity-70 mb-6">
              A critical error occurred. We&apos;ve been notified and are working on a fix.
            </p>

            {/* Error digest in development */}
            {process.env.NODE_ENV === 'development' && error.digest && (
              <div
                className="rounded-lg p-3 mb-6 text-left"
                style={{
                  boxShadow:
                    'inset -2px -2px 3px rgba(255, 255, 255, 0.85), inset 1px 1px 3px rgba(200, 200, 210, 0.2)',
                }}
              >
                <p className="text-xs font-mono opacity-60 break-all">
                  Digest: {error.digest}
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => reset()}
                className="px-6 py-3 rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  backgroundColor: 'hsl(82, 32%, 16%)',
                  color: 'white',
                  boxShadow:
                    '3px 3px 5px -1px rgba(200, 200, 210, 0.2), -2px -2px 5px rgba(255, 255, 255, 0.85)',
                }}
              >
                Try again
              </button>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages --
                  global-error.tsx renders outside the Next.js context (has its own html/body),
                  so next/link cannot be used here */}
              <a
                href="/"
                className="px-6 py-3 rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  boxShadow:
                    '3px 3px 5px -1px rgba(200, 200, 210, 0.2), -2px -2px 5px rgba(255, 255, 255, 0.85)',
                }}
              >
                Go home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
