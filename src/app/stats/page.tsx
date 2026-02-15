import { Container } from '@/components/Container'
import { Heading } from '@/components/Heading'
import { Metadata } from 'next'
import dynamic from 'next/dynamic'

const StatsOverview = dynamic(() => import('@/components/stats/stats-overview').then(m => m.StatsOverview))
const VisitorChart = dynamic(() => import('@/components/stats/visitor-chart').then(m => m.VisitorChart))
const ContributionGraph = dynamic(() => import('@/components/github/contribution-graph').then(m => m.ContributionGraph))
const PopularPosts = dynamic(() => import('@/components/stats/popular-posts').then(m => m.PopularPosts))
const TechStack = dynamic(() => import('@/components/stats/tech-stack').then(m => m.TechStack))

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
    <div className="py-20">
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
            <PopularPosts />
            <TechStack />
          </div>
        </div>
      </Container>
    </div>
  )
}
