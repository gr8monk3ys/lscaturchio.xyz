"use client"

import { Container } from '@/components/Container'
import { Heading } from '@/components/Heading'
import { Check, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { submitWrite } from '@/lib/fetcher'

/**
 * `confirm` is an active subscription waiting on the reader. The page never
 * unsubscribes on load, because mail scanners open every link in a message;
 * the button below is the only thing that does.
 */
export type UnsubscribeStatus = 'confirm' | 'success' | 'error' | 'no-token'

export function UnsubscribePageClient({
  status: initialStatus,
  message: initialMessage,
  token,
}: {
  status: UnsubscribeStatus
  message: string
  token?: string
}) {
  const [status, setStatus] = useState(initialStatus)
  const [message, setMessage] = useState(initialMessage)
  const [pending, setPending] = useState(false)

  const confirm = async () => {
    setPending(true)
    const result = await submitWrite<{ message?: string }>('/api/newsletter/unsubscribe', {
      token,
    })
    setPending(false)

    if (result.kind === 'ok') {
      setStatus('success')
      setMessage(result.data?.message || 'Successfully unsubscribed')
    } else if (result.kind === 'network') {
      setStatus('error')
      setMessage('Network error. Please try again later.')
    } else {
      setStatus('error')
      setMessage(result.message || 'Failed to unsubscribe. Please try again later.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-20">
      <Container>
        <div className="max-w-md mx-auto text-center">
          {/* Static: this is the entire page; it must never mount hidden. */}
          <div>
              <div className="mb-6 flex justify-center">
                {status === 'success' && (
                  <div className="h-16 w-16 rounded-full bg-success-muted flex items-center justify-center">
                    <Check className="h-8 w-8 text-success" />
                  </div>
                )}
                {(status === 'error' || status === 'no-token') && (
                  <div className="h-16 w-16 rounded-full bg-destructive-muted flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                  </div>
                )}
              </div>

              <Heading as="h1" className="mb-4">
                {status === 'confirm' && 'Unsubscribe from the newsletter?'}
                {status === 'success' && 'Unsubscribed Successfully'}
                {status === 'error' && 'Unsubscribe Failed'}
                {status === 'no-token' && 'Invalid Link'}
              </Heading>

              <p className="text-muted-foreground mb-8" aria-live="polite">
                {status === 'confirm'
                  ? 'You will stop receiving emails from me. Nothing changes until you press the button.'
                  : message}
              </p>

              {status === 'success' && (
                <p className="text-sm text-muted-foreground mb-8">
                  You&apos;ve been removed from my newsletter. You won&apos;t receive any more emails from me.
                  I&apos;m sorry to see you go!
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {status === 'confirm' && (
                  <button
                    type="button"
                    onClick={confirm}
                    disabled={pending}
                    aria-busy={pending}
                    className="px-6 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
                  >
                    Unsubscribe
                  </button>
                )}
                <Link
                  href="/"
                  className={
                    status === 'confirm'
                      ? 'px-6 py-3 rounded-md border border-border hover:bg-accent transition-colors'
                      : 'px-6 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors'
                  }
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
          </div>
        </div>
      </Container>
    </div>
  )
}
