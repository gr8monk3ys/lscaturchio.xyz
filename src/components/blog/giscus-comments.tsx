"use client"

import { useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'

interface GiscusCommentsProps {
  repo: string
  repoId: string
  category: string
  categoryId: string
}

export function GiscusComments({
  repo = "lscaturchio/lscaturchio.xyz",
  repoId = "YOUR_REPO_ID", // TODO: Replace with actual repo ID
  category = "Blog Comments",
  categoryId = "YOUR_CATEGORY_ID", // TODO: Replace with actual category ID
}: GiscusCommentsProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    if (!ref.current || ref.current.hasChildNodes()) return

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
  }, [repo, repoId, category, categoryId, resolvedTheme])

  // Update theme when it changes
  useEffect(() => {
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
  }, [resolvedTheme])

  return (
    <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
      <h3 className="text-2xl font-bold mb-6 text-foreground">Comments</h3>
      <div ref={ref} />
    </div>
  )
}
