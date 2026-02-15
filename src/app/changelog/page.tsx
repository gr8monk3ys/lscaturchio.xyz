import { Container } from '@/components/Container'
import { Heading } from '@/components/Heading'
import { Metadata } from 'next'
import { ChangelogTimeline } from '@/components/changelog/changelog-timeline'
import Link from 'next/link'

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

          <ChangelogTimeline />
        </div>
      </Container>
    </div>
  )
}
