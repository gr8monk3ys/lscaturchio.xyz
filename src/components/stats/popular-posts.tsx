"use client"

import { useMemo } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { fetchJson, unwrapApiData } from '@/lib/fetcher'

interface PopularPostsPayload {
  available?: boolean
  message?: string
  views?: Array<{ slug: string; title: string; views: number }>
}

export function PopularPosts() {
  const { data, isLoading, error } = useSWR<{ data?: PopularPostsPayload } | PopularPostsPayload>(
    '/api/views?format=detailed',
    fetchJson,
    { revalidateOnFocus: false }
  )

  const payload = data ? unwrapApiData(data) : null

  const posts = useMemo(() => {
    if (!payload?.available || !Array.isArray(payload.views)) return []
    const rows = payload.views
    return rows
      .slice()
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
      .map((post) => ({
        title: post.title,
        url: `/blog/${post.slug}`,
        views: post.views,
      }))
  }, [payload])

  return (
    <div>
      <h3 className="label-mono mb-4">Popular Posts</h3>

      {isLoading ? (
        <div className="border-t border-border" aria-busy="true" aria-label="Loading popular posts">
          {[1, 2, 3, 4, 5].map((slot) => (
            <div key={`popular-skeleton-${slot}`} className="animate-pulse flex items-center justify-between border-b border-border py-3" role="presentation">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-16" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-sm text-muted-foreground py-4">
          {error instanceof Error ? error.message : 'Failed to load popular posts'}
        </div>
      ) : !payload?.available ? (
        <div className="text-sm text-muted-foreground py-4">
          {payload?.message || 'Public view data is unavailable right now.'}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-sm text-muted-foreground py-4">
          No ranked posts yet.
        </div>
      ) : (
        <div className="border-t border-border">
          {posts.map((post, index) => (
            <Link
              key={post.url}
              href={post.url}
              className="flex items-center justify-between gap-4 group border-b border-border py-3 hover:translate-x-1 transition-transform"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="label-mono w-6 shrink-0 text-muted-foreground">
                  {index + 1}
                </span>
                <p className="text-sm text-foreground group-hover:text-primary truncate">
                  {post.title}
                </p>
              </div>
              <span className="label-mono shrink-0 text-muted-foreground">
                {post.views.toLocaleString()} views
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
