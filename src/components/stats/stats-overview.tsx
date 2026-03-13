"use client"

import { useMemo } from 'react'
import { m } from '@/lib/motion'
import { Clock3, Eye, FileText, Users } from 'lucide-react'
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
    bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    color: 'text-orange-600 dark:text-orange-400',
    icon: Clock3,
    label: 'Avg. Read Time',
    suffix: ' min',
  },
  newsletterSubscribers: {
    bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    color: 'text-purple-600 dark:text-purple-400',
    icon: Users,
    label: 'Newsletter Subscribers',
  },
  totalPosts: {
    bgColor: 'bg-green-100 dark:bg-green-900/20',
    color: 'text-green-600 dark:text-green-400',
    icon: FileText,
    label: 'Blog Posts',
  },
  totalViews: {
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    color: 'text-blue-600 dark:text-blue-400',
    icon: Eye,
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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {(isLoading ? Array.from({ length: 4 }, (_, index) => index) : cards).map((card, index) => {
            if (typeof card === 'number') {
              return (
                <div
                  key={`stats-skeleton-${card}`}
                  className="rounded-2xl border border-gray-200 p-6 dark:border-gray-800"
                  aria-hidden="true"
                >
                  <div className="mb-5 h-12 w-12 animate-pulse rounded-xl bg-muted" />
                  <div className="space-y-3">
                    <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                    <div className="h-8 w-32 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-40 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              )
            }

            const Icon = card.icon

            return (
              <m.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                className="rounded-2xl border border-gray-200 p-6 dark:border-gray-800"
              >
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div className={`rounded-xl p-3 ${card.bgColor}`}>
                    <Icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      card.metric.available
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {card.metric.available ? 'Live' : 'Unavailable'}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="text-3xl font-bold tabular-nums">
                    {formatMetricValue(card.metric, 'suffix' in card ? card.suffix : undefined)}
                  </p>
                  <p className="min-h-5 text-sm text-muted-foreground">
                    {card.metric.available
                      ? 'Public aggregate data'
                      : card.metric.note || 'This metric is not public yet.'}
                  </p>
                </div>
              </m.div>
            )
          })}
        </div>

        {hasUnavailableMetrics && (
          <p className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            Only public, aggregate metrics are shown here. When a source is private or unavailable, the UI
            labels it instead of estimating.
          </p>
        )}
      </div>
  )
}
