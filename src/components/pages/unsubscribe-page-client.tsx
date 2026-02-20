"use client"

import { Container } from '@/components/Container'
import { Heading } from '@/components/Heading'
import { LazyMotion, domAnimation, m } from '@/lib/motion'
import { Check, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export type UnsubscribeStatus = 'success' | 'error' | 'no-token'

export function UnsubscribePageClient({ status, message }: { status: UnsubscribeStatus; message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center py-20">
      <Container>
        <div className="max-w-md mx-auto text-center">
          <LazyMotion features={domAnimation}>
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-6 flex justify-center">
                {status === 'success' && (
                  <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                )}
                {(status === 'error' || status === 'no-token') && (
                  <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                  </div>
                )}
              </div>

              <Heading as="h1" className="mb-4">
                {status === 'success' && 'Unsubscribed Successfully'}
                {status === 'error' && 'Unsubscribe Failed'}
                {status === 'no-token' && 'Invalid Link'}
              </Heading>

              <p className="text-muted-foreground mb-8">{message}</p>

              {status === 'success' && (
                <p className="text-sm text-muted-foreground mb-8">
                  You&apos;ve been removed from my newsletter. You won&apos;t receive any more emails from me.
                  I&apos;m sorry to see you go!
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/"
                  className="px-6 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Back to Home
                </Link>
                {status === 'success' && (
                  <Link
                    href="/blog"
                    className="px-6 py-3 rounded-md border border-border hover:bg-accent transition-colors"
                  >
                    Browse Blog
                  </Link>
                )}
              </div>
            </m.div>
          </LazyMotion>
        </div>
      </Container>
    </div>
  )
}
