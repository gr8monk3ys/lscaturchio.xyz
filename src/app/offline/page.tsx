import { Container } from '@/components/Container'
import { Heading } from '@/components/Heading'
import { WifiOff } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Offline | Lorenzo Scaturchio',
  description: 'You are currently offline',
}

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-20">
      <Container>
        <div className="max-w-md mx-auto text-center">
          <div className="mb-6 flex justify-center">
            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
              <WifiOff className="h-12 w-12 text-muted-foreground" />
            </div>
          </div>

          <Heading as="h1" className="mb-4">
            You&apos;re Offline
          </Heading>

          <p className="text-muted-foreground mb-8">
            It looks like you&apos;ve lost your internet connection.
            Some cached pages may still be available.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="px-6 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Go to Home
            </Link>
            <Link
              href="/blog"
              className="px-6 py-3 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-accent transition-colors"
            >
              View Blog
            </Link>
          </div>

          <p className="mt-8 text-sm text-muted-foreground">
            Your connection will be restored automatically when you&apos;re back online.
          </p>
        </div>
      </Container>
    </div>
  )
}
