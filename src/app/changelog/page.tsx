import { Container } from '@/components/Container'
import { Heading } from '@/components/Heading'
import { Metadata } from 'next'
import { ChangelogTimeline } from '@/components/changelog/changelog-timeline'
import Link from 'next/link'
import { ROADMAP, type RoadmapStatus } from '@/constants/roadmap'
import { getShippedPrs } from '@/lib/changelog'
import { buildPageMetadata } from '@/lib/seo'

// The shipped feed derives from merged PRs; refresh it daily without a rebuild.
export const revalidate = 86400

// Conventional-commit kinds → reader-facing labels.
const KIND_LABELS: Record<string, string> = {
  feat: 'Added',
  fix: 'Fixed',
  perf: 'Faster',
  docs: 'Docs',
  test: 'Tests',
}

export const metadata: Metadata = buildPageMetadata({
  title: 'Changelog',
  // Plain apostrophes: this is a meta description, not JSX, so the HTML
  // entities that used to sit here were served literally to crawlers.
  description:
    "See what's new, what's changed, and what's been fixed on this website.",
  path: '/changelog',
})

export default async function ChangelogPage() {
  const shipped = await getShippedPrs(30)
  const grouped = {
    now: ROADMAP.filter((item) => item.status === 'now'),
    next: ROADMAP.filter((item) => item.status === 'next'),
    later: ROADMAP.filter((item) => item.status === 'later'),
  } as const

  const statusMeta: Record<RoadmapStatus, { label: string }> = {
    // No descriptions. "Now / Current implementation focus" restated the
    // label in longer words; the three columns explain themselves.
    now: { label: 'Now' },
    next: { label: 'Next' },
    later: { label: 'Later' },
  }

  return (
    <div className="py-20">
      <Container>
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <Heading as="h1" className="mb-4">
              Changelog
            </Heading>
            <p className="text-lg text-muted-foreground">
              What changed here, and when. Hand-picked rather than generated from commits, so
              it records the things worth telling you about rather than every push.
            </p>
            <div className="mt-4">
              <Link
                href="/changelog/rss.xml"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Subscribe via RSS
              </Link>
            </div>
          </div>

          <section id="roadmap" className="mb-12 scroll-mt-28">
            <div className="mb-4">
              <h2 className="text-2xl font-semibold">Roadmap</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Strategy lives here. Release notes stay below.
              </p>
            </div>

            {/* Three hairline stacks, not a three-column tile grid with cards
                nested inside cards. This was the second banned `neu-card` grid
                on the site after /projects lost its own; the roadmap is a list
                of three lists and reads as one. */}
            <div className="grid grid-cols-1 gap-x-10 lg:grid-cols-3">
              {(Object.keys(grouped) as Array<RoadmapStatus>).map((status) => (
                <div key={status} className="border-t border-border pt-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="label-mono">{statusMeta[status].label}</h3>
                    <span className="label-mono tabular-nums">
                      {grouped[status].length}
                    </span>
                  </div>

                  <ul className="mt-4">
                    {grouped[status].length === 0 && (
                      <li className="py-3 text-sm text-muted-foreground">
                        Nothing queued here right now.
                      </li>
                    )}
                    {grouped[status].map((item) => (
                      <li key={item.id} className="border-b border-border py-4 last:border-b-0">
                        <h4 className="font-medium leading-tight">{item.title}</h4>
                        <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                        {item.tags?.length ? (
                          <p className="label-mono mt-3 normal-case tracking-normal text-muted-foreground">
                            {item.tags.join("  ·  ")}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {shipped.length > 0 && (
            <section id="shipped" className="mb-12 scroll-mt-28">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold">Shipped</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Every change to this site lands as a pull request, so this feed reads straight
                  from the repository — it cannot fall behind the way a hand-written list does.
                </p>
              </div>
              <ul className="divide-y divide-border border-y border-border">
                {shipped.map((pr) => (
                  <li key={pr.number} className="py-3">
                    <a
                      href={pr.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="label-link group flex-wrap items-baseline gap-x-4 gap-y-1"
                    >
                      <span className="label-mono w-24 shrink-0 tabular-nums">{pr.mergedAt}</span>
                      <span className="label-mono w-14 shrink-0 text-primary">
                        {KIND_LABELS[pr.kind] ?? 'Changed'}
                      </span>
                      <span className="min-w-0 flex-1 text-sm transition-colors group-hover:text-primary">
                        {pr.title}
                      </span>
                      <span className="label-mono">#{pr.number}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h2 className="text-2xl font-semibold mb-4">Milestones</h2>
            <p className="text-sm text-muted-foreground mb-6">
              The hand-picked turning points, with the granular trail above.
            </p>
          </section>

          <ChangelogTimeline />
        </div>
      </Container>
    </div>
  )
}
