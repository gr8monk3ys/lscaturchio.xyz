"use client"

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Container } from '@/components/Container'
import { Heading } from '@/components/Heading'
import { motion } from 'framer-motion'
import { Loader2, Check, AlertCircle } from 'lucide-react'
import Link from 'next/link'

type UnsubscribeStatus = 'loading' | 'success' | 'error' | 'no-token'

function UnsubscribeContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<UnsubscribeStatus>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')

    if (!token) {
      setStatus('no-token')
      setMessage('No unsubscribe token provided')
      return
    }

    const unsubscribe = async () => {
      try {
        const response = await fetch('/api/newsletter/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (response.ok) {
          setStatus('success')
          setMessage(data.message || 'Successfully unsubscribed')
        } else {
          setStatus('error')
          setMessage(data.error || 'Failed to unsubscribe')
        }
      } catch (error) {
        setStatus('error')
        setMessage('Network error. Please try again later.')
      }
    }

    unsubscribe()
  }, [searchParams])

  return (
    <main className="min-h-screen flex items-center justify-center py-20">
      <Container>
        <div className="max-w-md mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6 flex justify-center">
              {status === 'loading' && (
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
              )}
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
              {status === 'loading' && 'Unsubscribing...'}
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
                  className="px-6 py-3 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-accent transition-colors"
                >
                  Browse Blog
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </Container>
    </main>
  )
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center py-20">
        <Container>
          <div className="max-w-md mx-auto text-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
          </div>
        </Container>
      </main>
    }>
      <UnsubscribeContent />
    </Suspense>
  )
}
