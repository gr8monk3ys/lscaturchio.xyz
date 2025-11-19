import { Container } from '@/components/Container'
import { Heading } from '@/components/Heading'
import { Metadata } from 'next'
import { SnippetsGrid } from '@/components/snippets/snippets-grid'

export const metadata: Metadata = {
  title: 'Code Snippets | Lorenzo Scaturchio',
  description: 'A collection of useful code snippets, utilities, and one-liners for web development, AI, and data science.',
  openGraph: {
    title: 'Code Snippets | Lorenzo Scaturchio',
    description: 'A collection of useful code snippets, utilities, and one-liners.',
    url: 'https://lscaturchio.xyz/snippets',
  },
}

export default function SnippetsPage() {
  return (
    <main className="py-20">
      <Container>
        <div className="max-w-4xl mx-auto">
          <Heading as="h1" className="mb-4">
            Code Snippets
          </Heading>
          <p className="text-lg text-muted-foreground mb-12">
            A searchable library of useful code snippets, utilities, and solutions to common problems.
            Copy, paste, and adapt for your projects.
          </p>

          <SnippetsGrid />
        </div>
      </Container>
    </main>
  )
}
