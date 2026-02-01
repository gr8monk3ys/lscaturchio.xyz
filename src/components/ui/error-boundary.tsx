'use client'

import { Component, ReactNode } from 'react'
import Link from 'next/link'
import { logError } from '@/lib/logger'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode)
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Reusable React Error Boundary component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs them, and displays a fallback UI instead of crashing.
 *
 * @example
 * // Basic usage with default fallback
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 *
 * @example
 * // With custom fallback component
 * <ErrorBoundary fallback={<CustomErrorUI />}>
 *   <MyComponent />
 * </ErrorBoundary>
 *
 * @example
 * // With render prop for access to error and reset
 * <ErrorBoundary
 *   fallback={(error, reset) => (
 *     <div>
 *       <p>Error: {error.message}</p>
 *       <button onClick={reset}>Retry</button>
 *     </div>
 *   )}
 * >
 *   <MyComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    logError('ErrorBoundary caught an error', error, {
      component: 'ErrorBoundary',
      componentStack: errorInfo.componentStack || undefined,
    })

    this.props.onError?.(error, errorInfo)
  }

  resetErrorBoundary = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      const { fallback } = this.props
      const { error } = this.state

      // Render prop pattern
      if (typeof fallback === 'function') {
        return fallback(error, this.resetErrorBoundary)
      }

      // Static fallback element
      if (fallback) {
        return fallback
      }

      // Default fallback UI
      return (
        <DefaultErrorFallback
          error={error}
          reset={this.resetErrorBoundary}
        />
      )
    }

    return this.props.children
  }
}

/**
 * Default error fallback UI matching the site's design system
 */
interface DefaultErrorFallbackProps {
  error: Error
  reset: () => void
  title?: string
  description?: string
  showHomeLink?: boolean
}

export function DefaultErrorFallback({
  error,
  reset,
  title = 'Something went wrong',
  description = 'We encountered an unexpected error. Please try again.',
  showHomeLink = true,
}: DefaultErrorFallbackProps): ReactNode {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-12">
      <div className="neu-card rounded-2xl p-8 sm:p-12 max-w-md w-full text-center">
        {/* Error icon */}
        <div className="mb-6 flex justify-center">
          <div className="neu-pressed rounded-full p-4">
            <svg
              className="h-8 w-8 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* Error message */}
        <h2 className="text-section-title mb-3">{title}</h2>
        <p className="text-description mb-6">{description}</p>

        {/* Error details in development */}
        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="neu-pressed-sm rounded-lg p-3 mb-6 text-left">
            <p className="text-xs font-mono text-muted-foreground break-all">
              {error.message}
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="neu-button bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-all focus-ring"
          >
            Try again
          </button>
          {showHomeLink && (
            <Link
              href="/"
              className="neu-button px-6 py-3 rounded-xl font-medium text-foreground hover:text-primary transition-all focus-ring"
            >
              Go home
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default ErrorBoundary
