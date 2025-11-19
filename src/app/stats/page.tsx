import { Container } from '@/components/Container'
import { Heading } from '@/components/Heading'
import { Metadata } from 'next'
import { StatsOverview } from '@/components/stats/stats-overview'
import { PopularPosts } from '@/components/stats/popular-posts'
import { EngagementStats } from '@/components/stats/engagement-stats'
import { VisitorChart } from '@/components/stats/visitor-chart'
import { TechStack } from '@/components/stats/tech-stack'
import { ContributionGraph } from '@/components/github/contribution-graph'

export const metadata: Metadata = {
  title: 'Site Statistics | Lorenzo Scaturchio',
  description: 'Real-time analytics and insights about this website - visitors, popular posts, and technology stack.',
  openGraph: {
    title: 'Site Statistics | Lorenzo Scaturchio',
    description: 'Real-time analytics and insights about this website.',
    url: 'https://lscaturchio.xyz/stats',
  },
}

export default function StatsPage() {
  return (
    <main className="py-20">
      <Container>
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <Heading as="h1" className="mb-4">
              Site Statistics
            </Heading>
            <p className="text-lg text-muted-foreground">
              Real-time data about this website. Transparency is important - see exactly
              what I see.
            </p>
          </div>

          <div className="space-y-8">
            <StatsOverview />
            <VisitorChart />
            <ContributionGraph />
            <div className="grid lg:grid-cols-2 gap-8">
              <PopularPosts />
              <EngagementStats />
            </div>
            <TechStack />
          </div>
        </div>
      </Container>
    </main>
  )
}
