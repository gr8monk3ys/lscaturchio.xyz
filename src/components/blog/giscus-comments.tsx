"use client"

import { useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'

interface GiscusCommentsProps {
  repo?: string
  repoId?: string
  category?: string
  categoryId?: string
}

export function GiscusComments({
  repo = process.env.NEXT_PUBLIC_GISCUS_REPO || "gr8monk3ys/lscaturchio.xyz",
  repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID || "",
  category = process.env.NEXT_PUBLIC_GISCUS_CATEGORY || "Blog Comments",
  categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID || "",
}: GiscusCommentsProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()
  const isConfigured = Boolean(repoId && categoryId)

  useEffect(() => {
    if (!isConfigured || !ref.current || ref.current.hasChildNodes()) return

    const script = document.createElement('script')

    const config = {
      src: 'https://giscus.app/client.js',
      'data-repo': repo,
      'data-repo-id': repoId,
      'data-category': category,
      'data-category-id': categoryId,
      'data-mapping': 'pathname',
      'data-strict': '0',
      'data-reactions-enabled': '1',
      'data-emit-metadata': '0',
      'data-input-position': 'bottom',
      'data-theme': resolvedTheme === 'dark' ? 'dark' : 'light',
      'data-lang': 'en',
      'data-loading': 'lazy',
      crossOrigin: 'anonymous',
      async: true,
    }

    Object.entries(config).forEach(([key, value]) => {
      if (typeof value === 'boolean') {
        if (value) script.setAttribute(key, '')
      } else {
        script.setAttribute(key, String(value))
      }
    })

    ref.current.appendChild(script)
  }, [isConfigured, repo, repoId, category, categoryId, resolvedTheme])

  // Update theme when it changes
  useEffect(() => {
    if (!isConfigured) return

    const iframe = document.querySelector<HTMLIFrameElement>('iframe.giscus-frame')
    if (!iframe) return

    iframe.contentWindow?.postMessage(
      {
        giscus: {
          setConfig: {
            theme: resolvedTheme === 'dark' ? 'dark' : 'light',
          },
        },
      },
      'https://giscus.app'
    )
  }, [isConfigured, resolvedTheme])

  // Don't render if Giscus is not configured
  if (!isConfigured) {
    return null
  }

  return (
    <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
      <h3 className="text-2xl font-bold mb-6 text-foreground">Comments</h3>
      <div ref={ref} />
    </div>
  )
}
