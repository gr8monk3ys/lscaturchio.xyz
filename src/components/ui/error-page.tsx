'use client'

import { useEffect, type ReactNode } from 'react'
import Link from 'next/link'
import { logError } from '@/lib/logger'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
  /** Wall label above the title, e.g. "Gallery · Error". */
  kicker?: string
  title?: string
  description?: string
  /** Kept for call-site compatibility; the composition no longer draws one. */
  icon?: ReactNode
  homeLabel?: string
}

/**
 * Shared error boundary UI, composed like `not-found.tsx` and `offline`.
 *
 * It used to be a centred `neu-card rounded-2xl` with a warning glyph in a
 * `neu-pressed rounded-full` well — the pre-redesign template, on the surface
 * a reader only sees when something has already gone wrong. Two of the three
 * things it did there worked against it: the card floated on a site with no
 * floating cards, and the icon told the reader nothing the sentence beneath it
 * did not say better. What survives is the recovery: retry first, then a way
 * out, and the digest for anyone reporting it.
 *
 * The `icon` prop stays on the interface and is ignored, so the three
 * route-level `error.tsx` files did not all need editing to stop passing one.
 */
export function ErrorPage({
  error,
  reset,
  kicker = 'Gallery · Error',
  // The house voice, which PRODUCT.md says governs error messages as much as
  // essays. The old defaults were the only copy on the site that read like a
  // dialog box.
  title = 'This page broke',
  description = 'Something on this page failed to load. Reloading usually works; if it does not, the rest of the site is still fine.',
  homeLabel = 'Back to the entrance',
}: ErrorPageProps) {
  useEffect(() => {
    logError(title, error, { digest: error.digest })
  }, [error, title])

  return (
    <div className="mx-auto flex min-h-[72vh] w-full max-w-6xl items-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl">
        <span className="label-mono block">{kicker}</span>

        <h1 className="mt-5 text-display">{title}</h1>

        <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
          {description}
        </p>

        {error.digest && (
          <p className="label-mono mt-5">Reference {error.digest}</p>
        )}

        {process.env.NODE_ENV === 'development' && error.message && (
          <pre className="mt-5 max-w-xl overflow-x-auto border border-border bg-card p-3 font-mono text-xs text-muted-foreground">
            {error.message}
          </pre>
        )}

        <hr className="gallery-rule my-8" />

        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <button
            type="button"
            onClick={() => reset()}
            className="label-mono label-link text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            Try again
          </button>
          <Link
            href="/"
            className="label-mono label-link text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            ← {homeLabel}
          </Link>
        </div>
      </div>
    </div>
  )
}
