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
      description="We couldn't load the stats page. This might be a temporary issue with data fetching or analytics services."
    />
  )
}
