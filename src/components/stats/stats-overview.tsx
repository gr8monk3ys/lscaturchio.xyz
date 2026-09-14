import type { StatMetric, StatsOverview as StatsOverviewData } from '@/lib/site-stats'

const numberFormatter = new Intl.NumberFormat('en-US')

const snapshotFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'UTC',
})

const cards = [
  { key: 'totalViews', label: 'Total Views' },
  { key: 'totalPosts', label: 'Blog Posts' },
  { key: 'newsletterSubscribers', label: 'Newsletter Subscribers' },
  { key: 'avgReadTime', label: 'Avg. Read Time', suffix: ' min' },
] as const

function formatMetricValue(metric: StatMetric, suffix?: string) {
  if (!metric.available || metric.value === null) {
    return 'Unavailable'
  }

  return `${numberFormatter.format(metric.value)}${suffix ?? ''}`
}

/**
 * The overview, rendered from data the page already has.
 *
 * This was a client component that fetched three endpoints on mount and
 * rendered four pulsing bars until they answered. Every other branch it could
 * render was honest; the loading branch was the only one a reader with JS off
 * ever saw, and it could not be told apart from a broken page. The states are
 * unchanged — they are simply decided on the server now.
 */
export function StatsOverview({
  generatedAt,
  overview,
}: {
  generatedAt: string
  overview: StatsOverviewData
}) {
  const unavailable = cards.filter(({ key }) => !overview[key].available)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 divide-border border-y border-border sm:grid-cols-4 sm:divide-x">
        {cards.map((card) => {
          const metric = overview[card.key]

          return (
            <div key={card.label} className="px-5 py-6">
              <p className="text-section-title tabular-nums">
                {formatMetricValue(metric, 'suffix' in card ? card.suffix : undefined)}
              </p>
              <p className="label-mono mt-2">{card.label}</p>
              <p className="label-mono mt-1 text-muted-foreground">
                {metric.available ? 'Sourced' : 'Unavailable'}
              </p>
            </div>
          )
        })}
      </div>

      {/* The note renders unconditionally, because the sentence a reader most
          needs is the one that dates the numbers. "Sourced" above claims only
          that the source answered; this line says when it was asked. */}
      <p className="text-sm text-muted-foreground">
        Read{' '}
        <time dateTime={generatedAt}>
          {snapshotFormatter.format(new Date(generatedAt))} UTC
        </time>
        , and refreshed at most every 30 minutes.
        {unavailable.length > 0
          ? ' Only public, aggregate metrics appear here; when a source is private or unavailable it is labelled instead of estimated.'
          : ''}
      </p>
    </div>
  )
}
