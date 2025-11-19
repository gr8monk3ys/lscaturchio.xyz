import { Container } from '@/components/Container'
import { Heading } from '@/components/Heading'
import { Metadata } from 'next'
import { ApiDocumentation } from '@/components/api/api-documentation'

export const metadata: Metadata = {
  title: 'API Documentation | Lorenzo Scaturchio',
  description: 'Public API documentation for accessing blog posts, statistics, and other data programmatically.',
  openGraph: {
    title: 'API Documentation | Lorenzo Scaturchio',
    description: 'Public API documentation for accessing blog data.',
    url: 'https://lscaturchio.xyz/api-docs',
  },
}

export default function ApiDocsPage() {
  return (
    <main className="py-20">
      <Container>
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <Heading as="h1" className="mb-4">
              API Documentation
            </Heading>
            <p className="text-lg text-muted-foreground">
              Free and open API for accessing blog posts and site statistics. No authentication required.
            </p>
          </div>

          <ApiDocumentation />
        </div>
      </Container>
    </main>
  )
}
