'use client'

import { ErrorPage } from '@/components/ui/error-page'

/**
 * Error boundary for the changelog page.
 */
export default function ChangelogError({
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
      title="Failed to load changelog"
      description="We couldn't load the changelog. Please try again."
    />
  )
}
