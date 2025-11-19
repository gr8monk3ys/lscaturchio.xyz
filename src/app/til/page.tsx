import { Container } from '@/components/Container'
import { Heading } from '@/components/Heading'
import { Metadata } from 'next'
import { TILGrid } from '@/components/til/til-grid'

export const metadata: Metadata = {
  title: 'Today I Learned | Lorenzo Scaturchio',
  description: 'Quick learnings, insights, and discoveries from my journey in tech, AI, and development.',
  openGraph: {
    title: 'Today I Learned | Lorenzo Scaturchio',
    description: 'Quick learnings, insights, and discoveries from my journey in tech, AI, and development.',
    url: 'https://lscaturchio.xyz/til',
    images: [{ url: '/images/og-til.webp' }],
  },
}

export default function TILPage() {
  return (
    <main className="py-20">
      <Container>
        <div className="max-w-4xl mx-auto">
          <Heading as="h1" className="mb-4">
            Today I Learned
          </Heading>
          <p className="text-lg text-muted-foreground mb-12">
            A collection of quick learnings, insights, and &ldquo;aha&rdquo; moments.
            Think of this as my digital garden - a space for growing ideas that might not be
            fully-formed blog posts yet, but are worth sharing.
          </p>

          <TILGrid />
        </div>
      </Container>
    </main>
  )
}
