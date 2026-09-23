'use client'

import { ErrorPage } from '@/components/ui/error-page'

/**
 * Error boundary for the stats page.
 */
export default function StatsError({
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
      title="Failed to load statistics"
      description="The stats didn't load, usually a temporary problem with the analytics services. Try again in a moment."
    />
  )
}
