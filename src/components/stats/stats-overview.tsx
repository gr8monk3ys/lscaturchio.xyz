"use client"

import { useMemo } from 'react'
import useSWR from 'swr'
import { fetchJson } from '@/lib/fetcher'
import type { ApiEnvelope } from '@/lib/fetcher'
import type { OverviewData, OverviewMetric } from '@/lib/stats-data'

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
    fetchJson<ApiEnvelope<BlogStatsPayload>>('/api/blog-stats'),
    fetchJson<ApiEnvelope<ViewsPayload>>('/api/views?format=detailed'),
    fetchJson<ApiEnvelope<NewsletterStatsPayload>>('/api/newsletter/stats'),
  ])

  // Per-source failures degrade to a labelled "Unavailable" card. All three
  // failing at once is not four private sources, it is the API not answering —
  // that is worth saying out loud rather than labelling every card.
  const results = [blogStatsResult, viewsResult, newsletterResult]
  if (results.every((result) => result.status === 'rejected')) {
    throw new Error('Stats endpoints did not answer')
  }

  const blogStats = blogStatsResult.status === 'fulfilled' ? blogStatsResult.value.data : null
  const views = viewsResult.status === 'fulfilled' ? viewsResult.value.data : null
  const newsletter = newsletterResult.status === 'fulfilled' ? newsletterResult.value.data : null

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

export function StatsOverview({ fallbackData }: { fallbackData?: OverviewData }) {
  const { data, error, isLoading } = useSWR('stats-overview', loadOverview, {
    fallbackData,
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  })

  // `isLoading` stays true through the first request even when the server
  // supplied fallbackData, so the skeleton keys off having nothing to show.
  const showSkeleton = isLoading && !data

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

  if (error && !data) {
    return (
      <p className="border-y border-border px-5 py-6 text-sm text-muted-foreground">
        The metrics endpoint did not answer, so there is nothing to show. Rather than guess at
        numbers, this section stays empty until it responds again.
      </p>
    )
  }

  return (
    <div className="space-y-4">
        <div className="grid grid-cols-2 divide-border border-y border-border sm:grid-cols-4 sm:divide-x">
          {(showSkeleton ? Array.from({ length: 4 }, (_, index) => index) : cards).map((card) => {
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
