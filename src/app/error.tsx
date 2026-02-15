'use client'

import { ErrorPage } from '@/components/ui/error-page'

/**
 * Root error boundary for the application.
 * Catches errors in page components (but not layout errors - use global-error.tsx for that).
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorPage
      error={error}
      reset={reset}
      title="Something went wrong"
      description="We encountered an unexpected error. Please try again or return to the homepage."
    />
  )
}
