import { Container } from '@/components/Container'
import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { PageHead } from "@/components/ui/page-head";
import { buildPageMetadata } from "@/lib/seo";
import { getDetailedViewsSafe, getStatsOverview } from '@/lib/stats-data'

const StatsOverview = dynamic(() => import('@/components/stats/stats-overview').then(m => m.StatsOverview))
const VisitorChart = dynamic(() => import('@/components/stats/visitor-chart').then(m => m.VisitorChart))
const ContributionGraph = dynamic(() => import('@/components/github/contribution-graph').then(m => m.ContributionGraph))
const PopularPosts = dynamic(() => import('@/components/stats/popular-posts').then(m => m.PopularPosts))
const TechStack = dynamic(() => import('@/components/stats/tech-stack').then(m => m.TechStack))

export const metadata: Metadata = buildPageMetadata({
  title: 'Site Statistics',
  description:
    'A public snapshot of site metrics, writing activity, and the technology behind this website.',
  path: '/stats',
});

// Read the public stats on the server and hand them to SWR as fallback data.
// The page then paints real numbers on first load instead of skeletons, and
// SWR still revalidates on mount so the figures stay live.
export const revalidate = 300

export default async function StatsPage() {
  const [overview, views] = await Promise.all([getStatsOverview(), getDetailedViewsSafe()])

  // The API wraps payloads in `{ success, data }`; SWR's fallback has to match
  // exactly what fetchJson would have returned for the same key.
  const viewsFallback = { success: true as const, data: views }

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
            <StatsOverview fallbackData={overview} />
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
              <VisitorChart fallbackData={viewsFallback} />
              <div className="space-y-8">
                <PopularPosts fallbackData={viewsFallback} />
                <TechStack />
              </div>
            </div>
            <ContributionGraph />
          </div>
        </div>
      </Container>
    </div>
  )
}
