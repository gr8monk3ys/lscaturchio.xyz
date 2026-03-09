"use client"

import { useMemo } from 'react'
import { BarChart3 } from 'lucide-react'
import useSWR from 'swr'
import { fetchJson, unwrapApiData } from '@/lib/fetcher'

interface ViewRow {
  slug: string
  title: string
  views: number
}

interface ViewsPayload {
  available?: boolean
  message?: string
  views?: ViewRow[]
}

const numberFormatter = new Intl.NumberFormat('en-US')
const skeletonRows = ['views-skeleton-1', 'views-skeleton-2', 'views-skeleton-3', 'views-skeleton-4', 'views-skeleton-5']

export function VisitorChart() {
  const { data, isLoading } = useSWR<{ data?: ViewsPayload } | ViewsPayload>(
    '/api/views?format=detailed',
    fetchJson,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  )

  const payload = data ? unwrapApiData(data) : null

  const rows = useMemo(() => {
    if (!payload?.available || !Array.isArray(payload.views)) {
      return []
    }

    return payload.views.slice(0, 7)
  }, [payload])

  const maxViews = useMemo(
    () => rows.reduce((max, row) => Math.max(max, row.views), 0),
    [rows]
  )

  return (
    <div className="rounded-2xl border border-gray-200 p-6 dark:border-gray-800">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-semibold">Most Viewed Posts</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Aggregate public post views, ranked by total reads.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4" aria-hidden="true">
          {skeletonRows.map((skeletonId) => (
            <div key={skeletonId} className="space-y-2">
              <div className="h-4 w-40 animate-pulse rounded bg-muted" />
              <div className="h-3 w-full animate-pulse rounded-full bg-muted" />
            </div>
          ))}
        </div>
      ) : !payload?.available ? (
        <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-5 text-sm text-muted-foreground">
          {payload?.message || 'Public view data is unavailable right now.'}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-5 text-sm text-muted-foreground">
          Public view tracking is enabled, but there are no ranked posts yet.
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((row, index) => (
            <div key={row.slug} className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="w-6 text-sm font-medium text-muted-foreground tabular-nums">
                    {index + 1}
                  </span>
                  <p className="truncate text-sm font-medium text-foreground">{row.title}</p>
                </div>
                <span className="shrink-0 text-sm text-muted-foreground tabular-nums">
                  {numberFormatter.format(row.views)}
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary/75 transition-[width] duration-300"
                  style={{ width: `${maxViews > 0 ? (row.views / maxViews) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
