import type { RankedViews } from '@/lib/site-stats'

const numberFormatter = new Intl.NumberFormat('en-US')

/**
 * The ranking, rendered from data the page already has.
 *
 * The five pulsing rows this used to ship in its HTML were the page's most
 * misleading state: a reader could not tell a ranking that was still arriving
 * from one that would never arrive. The three real states below — no source,
 * a source with nothing in it, and a ranking — were all already written.
 */
export function VisitorChart({ rankedViews }: { rankedViews: RankedViews }) {
  const { available, note, rows } = rankedViews
  const maxViews = rows.reduce((max, row) => Math.max(max, row.views), 0)

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-section-title">Most viewed posts</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Aggregate public post views, ranked by total reads.
        </p>
      </div>

      {!available ? (
        <div className="text-sm text-muted-foreground">
          {note || 'Public view data is unavailable right now.'}
        </div>
      ) : rows.length === 0 ? (
        <div className="text-sm text-muted-foreground">
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
                  className="h-full rounded-full bg-primary/75"
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
