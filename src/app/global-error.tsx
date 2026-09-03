'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

/**
 * Global error boundary for handling errors in the root layout.
 * This is a special Next.js component that must render its own <html> and <body> tags.
 * It catches errors that occur during rendering of the root layout.
 *
 * It cannot rely on the app's stylesheet or its CSS custom properties loading, so
 * the palette below is inlined as literal values taken from DESIGN.md rather than
 * read from `--background` / `--foreground`. Dark mode keys off `prefers-color-scheme`
 * because the theme class lives on the root layout's <html>, which is gone here.
 */
const paletteCss = `
  :root {
    --ge-paper: #f9f8f5;
    --ge-card: #fbfaf9;
    --ge-ink: #1a1f23;
    --ge-ink-muted: #606976;
    --ge-hairline: #e2dbd5;
    --ge-forest: #184e35;
    --ge-forest-contrast: #ffffff;
    color-scheme: light;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --ge-paper: #111317;
      --ge-card: #16181d;
      --ge-ink: #fafafa;
      --ge-ink-muted: #abb0ba;
      --ge-hairline: #292c32;
      --ge-forest: #42a979;
      --ge-forest-contrast: #111317;
      color-scheme: dark;
    }
  }
  .ge-body {
    margin: 0;
    background: var(--ge-paper);
    color: var(--ge-ink);
    font-family: 'Instrument Sans', ui-sans-serif, system-ui, sans-serif;
    line-height: 1.65;
  }
  .ge-wrap {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }
  .ge-sheet {
    width: 100%;
    max-width: 34rem;
    background: var(--ge-card);
    border: 1px solid var(--ge-hairline);
    border-radius: 18px;
    padding: 32px;
  }
  .ge-label {
    font-family: 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.72rem;
    font-weight: 500;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--ge-ink-muted);
    font-feature-settings: 'tnum' 1;
    margin: 0;
  }
  .ge-title {
    font-family: 'Fraunces', ui-sans-serif, system-ui, sans-serif;
    font-size: clamp(1.9rem, 3.6vw, 3.2rem);
    font-weight: 700;
    line-height: 1.12;
    letter-spacing: -0.03em;
    margin: 16px 0 0;
  }
  .ge-copy {
    color: var(--ge-ink-muted);
    margin: 16px 0 0;
  }
  .ge-rule {
    border: 0;
    border-top: 1px solid var(--ge-hairline);
    margin: 24px 0;
  }
  .ge-digest {
    font-family: 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.75rem;
    color: var(--ge-ink-muted);
    word-break: break-all;
    margin: 0 0 24px;
  }
  .ge-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 16px;
  }
  .ge-cta {
    display: inline-flex;
    align-items: center;
    height: 40px;
    padding: 0 16px;
    border-radius: 14px;
    border: 1px solid var(--ge-forest);
    background: var(--ge-forest);
    color: var(--ge-forest-contrast);
    font: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1;
    cursor: pointer;
    transition: filter 150ms ease;
  }
  .ge-cta:hover { filter: brightness(1.05); }
  .ge-link {
    font-family: 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.72rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--ge-ink-muted);
    background: none;
    border: 0;
    padding: 0;
    cursor: pointer;
    text-underline-offset: 4px;
    transition: color 150ms ease;
  }
  .ge-link:hover { color: var(--ge-forest); text-decoration: underline; }
  .ge-cta:focus-visible, .ge-link:focus-visible {
    outline: 2px solid var(--ge-forest);
    outline-offset: 2px;
  }
`

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Report the error to Sentry
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: paletteCss }} />
      </head>
      <body className="ge-body">
        <div className="ge-wrap">
          <main className="ge-sheet">
            <p className="ge-label">Error &middot; Unrecoverable</p>
            <h1 className="ge-title">Something went wrong.</h1>
            <p className="ge-copy">
              A critical error broke the page before it could render. It has been
              reported; trying again often works, and the front page always does.
            </p>
            <hr className="ge-rule" />
            {process.env.NODE_ENV === 'development' && error.digest && (
              <p className="ge-digest">Digest: {error.digest}</p>
            )}
            <div className="ge-actions">
              <button type="button" onClick={() => reset()} className="ge-cta">
                Try again
              </button>
              <button
                type="button"
                onClick={() => {
                  // Hard navigation is deliberate: global-error replaces the root
                  // layout, so the Next router context is unavailable here. No
                  // basePath is configured, so the rule's hazard does not apply.
                  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
                  window.location.href = "/";
                }}
                className="ge-link"
              >
                Go home
              </button>
            </div>
          </main>
        </div>
      </body>
    </html>
  )
}
