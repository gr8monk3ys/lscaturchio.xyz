import { Container } from '@/components/Container'
import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { PageHead } from "@/components/ui/page-head";
import { buildPageMetadata } from "@/lib/seo";

const StatsOverview = dynamic(() => import('@/components/stats/stats-overview').then(m => m.StatsOverview))
const VisitorChart = dynamic(() => import('@/components/stats/visitor-chart').then(m => m.VisitorChart))
const ContributionGraph = dynamic(() => import('@/components/github/contribution-graph').then(m => m.ContributionGraph))
const TechStack = dynamic(() => import('@/components/stats/tech-stack').then(m => m.TechStack))

export const metadata: Metadata = buildPageMetadata({
  title: 'Stats',
  description:
    'What the site is made of and how much of it gets read. Sourced where a source exists, labelled where one does not.',
  path: '/stats',
});

export default function StatsPage() {
  return (
    <div className="py-20">
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
            <StatsOverview />
            {/* One ranking, not two. `VisitorChart` and `PopularPosts` both
                read /api/views?format=detailed and both ranked it — the same
                numbers, twice, under two headings. */}
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
              <VisitorChart />
              <TechStack />
            </div>
            <ContributionGraph />
          </div>
        </div>
      </Container>
    </div>
  )
}
