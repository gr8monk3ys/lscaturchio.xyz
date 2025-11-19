"use client"

import { Component, ReactNode } from 'react'
import { Container } from './Container'
import { Heading } from './Heading'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

/**
 * Error Boundary component to catch and handle React errors gracefully
 *
 * Usage:
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // In production, you might want to log to an error tracking service
    // e.g., Sentry, LogRocket, etc.
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
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
                Something went wrong
              </Heading>

              <p className="text-muted-foreground mb-6">
                We encountered an unexpected error. Don&apos;t worry, it&apos;s not your fault.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-6 text-left">
                  <summary className="cursor-pointer text-sm font-medium mb-2">
                    Error Details (Development Only)
                  </summary>
                  <pre className="p-4 bg-muted rounded-lg overflow-auto text-xs">
                    {this.state.error.message}
                    {'\n\n'}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => this.setState({ hasError: false })}
                  className="px-6 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Try Again
                </button>
                <Link
                  href="/"
                  className="px-6 py-3 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-accent transition-colors"
                >
                  Go to Home
                </Link>
              </div>
            </div>
          </Container>
        </div>
      )
    }

    return this.props.children
  }
}
