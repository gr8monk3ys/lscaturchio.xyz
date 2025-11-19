"use client"

import { useEffect } from 'react'
import { Container } from '@/components/Container'
import { Heading } from '@/components/Heading'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('TIL page error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center py-20">
      <Container>
        <div className="max-w-md mx-auto text-center">
          <div className="mb-6 flex justify-center">
            <div className="h-24 w-24 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
          </div>

          <Heading as="h1" className="mb-4">
            Failed to Load TIL Posts
          </Heading>

          <p className="text-muted-foreground mb-6">
            We couldn&apos;t load the Today I Learned posts. Please try again.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={reset}
              className="px-6 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
            <Link
              href="/blog"
              className="px-6 py-3 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-accent transition-colors"
            >
              View Blog
            </Link>
          </div>
        </div>
      </Container>
    </div>
  )
}
