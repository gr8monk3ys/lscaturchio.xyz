import { Container } from '@/components/Container'
import { Metadata } from 'next'
import { PageHead } from "@/components/ui/page-head";
import { buildPageMetadata } from "@/lib/seo";
import { StatsOverview } from '@/components/stats/stats-overview'
import { VisitorChart } from '@/components/stats/visitor-chart'
import { TechStack } from '@/components/stats/tech-stack'
import { ContributionGraph } from '@/components/github/contribution-graph'
import { getSiteStats } from '@/lib/site-stats'
import { getGithubContributions } from '@/lib/github-contributions'

export const metadata: Metadata = buildPageMetadata({
  title: 'Stats',
  description:
    'What the site is made of and how much of it gets read. Sourced where a source exists, labelled where one does not.',
  path: '/stats',
});

/**
 * Half an hour, and the numbers are in the HTML.
 *
 * This page used to render four client components that each fetched their own
 * endpoint on mount, so its server response carried sixty-three `animate-pulse`
 * nodes and not one number. With JS off, or a request that never came back, a
 * reader got pulsing grey bars with no way to tell loading from broken — the
 * only place on a site whose stated position is that every number is sourced
 * where a reader could not interpret what they were looking at.
 *
 * Awaiting the data here makes the honest branch the one that ships. The cost
 * is staleness bounded by `revalidate`, which is why the overview prints the
 * time it was read: a dated number can be judged, an undated one cannot.
 */
export const revalidate = 1800

export default async function StatsPage() {
  const [stats, contributions] = await Promise.all([
    getSiteStats(),
    getGithubContributions(),
  ])

  return (
    <div className="pt-4 pb-20">
      <Container>
        <div className="max-w-6xl mx-auto">
          <PageHead
            className="mb-12"
            kicker="Garden · Metrics"
            title="Site Statistics"
            blurb={
              <>
                A public snapshot of what this site actually tracks. Aggregate metrics stay visible,
                and anything private or unavailable is labeled instead of guessed.
              </>
            }
          />

          <div className="space-y-8">
            <StatsOverview generatedAt={stats.generatedAt} overview={stats.overview} />
            {/* One ranking, not two. `VisitorChart` and `PopularPosts` both
                read the views table and both ranked it — the same numbers,
                twice, under two headings. */}
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
              <VisitorChart rankedViews={stats.rankedViews} />
              <TechStack />
            </div>
            <ContributionGraph calendar={contributions} />
          </div>
        </div>
      </Container>
    </div>
  )
}
