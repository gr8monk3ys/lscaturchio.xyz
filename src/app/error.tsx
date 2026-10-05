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
      description="This page hit an unexpected error. Try again, or go back to the homepage."
    />
  )
}
