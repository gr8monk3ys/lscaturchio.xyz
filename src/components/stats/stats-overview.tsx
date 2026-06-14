"use client"

import { useMemo } from 'react'
import useSWR from 'swr'
import { fetchJson, unwrapApiData } from '@/lib/fetcher'

interface BlogStatsPayload {
  totalPosts?: number
  avgReadingTime?: number
}

interface ViewsPayload {
  views?: Array<{ views: number }>
  available?: boolean
  message?: string
}

interface NewsletterStatsPayload {
  activeSubscribers?: number | null
  available?: boolean
  message?: string
}

interface OverviewMetric {
  available: boolean
  note?: string
  value: number | null
}

interface OverviewData {
  avgReadTime: OverviewMetric
  newsletterSubscribers: OverviewMetric
  totalPosts: OverviewMetric
  totalViews: OverviewMetric
}

const numberFormatter = new Intl.NumberFormat('en-US')

const cardStyles = {
  avgReadTime: {
    label: 'Avg. Read Time',
    suffix: ' min',
  },
  newsletterSubscribers: {
    label: 'Newsletter Subscribers',
  },
  totalPosts: {
    label: 'Blog Posts',
  },
  totalViews: {
    label: 'Total Views',
  },
} as const

async function loadOverview(): Promise<OverviewData> {
  const [blogStatsResult, viewsResult, newsletterResult] = await Promise.allSettled([
    fetchJson<{ data?: BlogStatsPayload } | BlogStatsPayload>('/api/blog-stats'),
    fetchJson<{ data?: ViewsPayload } | ViewsPayload>('/api/views?format=detailed'),
    fetchJson<NewsletterStatsPayload>('/api/newsletter/stats'),
  ])

  const blogStats =
    blogStatsResult.status === 'fulfilled'
      ? unwrapApiData(blogStatsResult.value as { data?: BlogStatsPayload } | BlogStatsPayload)
      : null
  const views =
    viewsResult.status === 'fulfilled'
      ? unwrapApiData(viewsResult.value as { data?: ViewsPayload } | ViewsPayload)
      : null
  const newsletter = newsletterResult.status === 'fulfilled' ? newsletterResult.value : null

  const totalViews =
    views?.available && Array.isArray(views.views)
      ? views.views.reduce((sum, entry) => sum + (entry.views || 0), 0)
      : null

  return {
    totalViews: {
      value: totalViews,
      available: Boolean(views?.available && totalViews !== null),
      note:
        views?.message ||
        (viewsResult.status === 'rejected' ? 'Public view data is unavailable right now.' : undefined),
    },
    totalPosts: {
      value: typeof blogStats?.totalPosts === 'number' ? blogStats.totalPosts : null,
      available: typeof blogStats?.totalPosts === 'number',
      note:
        blogStatsResult.status === 'rejected' ? 'Blog metadata is unavailable right now.' : undefined,
    },
    newsletterSubscribers: {
      value: typeof newsletter?.activeSubscribers === 'number' ? newsletter.activeSubscribers : null,
      available: Boolean(newsletter?.available && typeof newsletter.activeSubscribers === 'number'),
      note:
        newsletter?.message ||
        (newsletterResult.status === 'rejected'
          ? 'Newsletter subscriber counts are unavailable right now.'
          : undefined),
    },
    avgReadTime: {
      value: typeof blogStats?.avgReadingTime === 'number' ? blogStats.avgReadingTime : null,
      available: typeof blogStats?.avgReadingTime === 'number',
      note:
        blogStatsResult.status === 'rejected'
          ? 'Reading-time estimates are unavailable right now.'
          : undefined,
    },
  }
}

function formatMetricValue(metric: OverviewMetric, suffix?: string) {
  if (!metric.available || metric.value === null) {
    return 'Unavailable'
  }

  return `${numberFormatter.format(metric.value)}${suffix ?? ''}`
}

export function StatsOverview() {
  const { data, isLoading } = useSWR('stats-overview', loadOverview, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  })

  const cards = useMemo(() => {
    if (!data) return []

    return (Object.entries(cardStyles) as Array<[keyof typeof cardStyles, (typeof cardStyles)[keyof typeof cardStyles]]>).map(
      ([key, style]) => ({
        ...style,
        metric: data[key],
      })
    )
  }, [data])

  const hasUnavailableMetrics = cards.some((card) => !card.metric.available)

  return (
    <div className="space-y-4">
        <div className="grid grid-cols-2 divide-border border-y border-border sm:grid-cols-4 sm:divide-x">
          {(isLoading ? Array.from({ length: 4 }, (_, index) => index) : cards).map((card) => {
            if (typeof card === 'number') {
              return (
                <div key={`stats-skeleton-${card}`} className="px-5 py-6" aria-hidden="true">
                  <div className="h-8 w-24 animate-pulse rounded bg-muted" />
                  <div className="mt-2 h-3 w-28 animate-pulse rounded bg-muted" />
                </div>
              )
            }

            return (
              <div key={card.label} className="px-5 py-6">
                <p className="font-display text-3xl font-semibold tracking-tight tabular-nums">
                  {formatMetricValue(card.metric, 'suffix' in card ? card.suffix : undefined)}
                </p>
                <p className="label-mono mt-2">{card.label}</p>
                <p className="label-mono mt-1 text-muted-foreground">
                  {card.metric.available ? 'Live' : 'Unavailable'}
                </p>
              </div>
            )
          })}
        </div>

        {hasUnavailableMetrics && (
          <p className="text-sm text-muted-foreground">
            Only public, aggregate metrics are shown here. When a source is private or unavailable, the UI
            labels it instead of estimating.
          </p>
        )}
      </div>
  )
}
