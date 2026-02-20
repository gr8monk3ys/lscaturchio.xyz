import { Container } from '@/components/Container'
import { Heading } from '@/components/Heading'
import { Metadata } from 'next'
import { ChangelogTimeline } from '@/components/changelog/changelog-timeline'
import Link from 'next/link'
import { ROADMAP, type RoadmapStatus } from '@/constants/roadmap'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Changelog | Lorenzo Scaturchio',
  description: 'See what&apos;s new, what&apos;s changed, and what&apos;s been fixed on this website.',
  openGraph: {
    title: 'Changelog | Lorenzo Scaturchio',
    description: 'Version history and updates for lscaturchio.xyz',
    url: 'https://lscaturchio.xyz/changelog',
  },
}

export default function ChangelogPage() {
  const grouped = {
    now: ROADMAP.filter((item) => item.status === 'now'),
    next: ROADMAP.filter((item) => item.status === 'next'),
    later: ROADMAP.filter((item) => item.status === 'later'),
  } as const

  const statusMeta: Record<RoadmapStatus, { label: string; description: string }> = {
    now: { label: 'Now', description: 'Current implementation focus' },
    next: { label: 'Next', description: 'Near-term planned work' },
    later: { label: 'Later', description: 'Backlog and exploratory ideas' },
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
              A transparent record of all additions, changes, and improvements to this website.
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {(Object.keys(grouped) as Array<RoadmapStatus>).map((status) => (
                <div key={status} className="neu-card p-5 rounded-2xl">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold">{statusMeta[status].label}</h3>
                    <span className="text-xs text-muted-foreground">
                      {grouped[status].length}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">
                    {statusMeta[status].description}
                  </p>

                  <div className="space-y-4">
                    {grouped[status].length === 0 && (
                      <p className="text-sm text-muted-foreground">No items yet.</p>
                    )}
                    {grouped[status].map((item) => (
                      <article key={item.id} className="rounded-xl border border-border/60 bg-background/70 p-4">
                        <h4 className="font-medium leading-tight">{item.title}</h4>
                        <p className="text-sm text-muted-foreground mt-2">{item.description}</p>
                        {item.tags?.length ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {item.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-[11px]">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        ) : null}
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Release Notes</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Detailed additions, fixes, and refactors by version.
            </p>
          </section>

          <ChangelogTimeline />
        </div>
      </Container>
    </div>
  )
}
