"use client"

import { useMemo } from 'react'
import Link from 'next/link'
import { TrendingUp } from 'lucide-react'
import useSWR from 'swr'
import { fetchJson, unwrapApiData } from '@/lib/fetcher'

export function PopularPosts() {
  const { data, isLoading, error } = useSWR<{ data?: { views?: Array<{ slug: string; title: string; views: number }> }; views?: Array<{ slug: string; title: string; views: number }> }>(
    '/api/views?format=detailed',
    fetchJson,
    { revalidateOnFocus: false }
  )

  const posts = useMemo(() => {
    if (!data) return []
    const unwrapped = unwrapApiData(data as { views?: Array<{ slug: string; title: string; views: number }> })
    const rows = Array.isArray(unwrapped.views) ? unwrapped.views : []
    return rows
      .slice()
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
      .map((post) => ({
        title: post.title,
        url: `/blog/${post.slug}`,
        views: post.views,
      }))
  }, [data])

  return (
    <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="text-xl font-semibold">Popular Posts</h3>
      </div>

      {isLoading ? (
        <div className="space-y-4" aria-busy="true" aria-label="Loading popular posts">
          {[1, 2, 3, 4, 5].map((slot) => (
            <div key={`popular-skeleton-${slot}`} className="animate-pulse flex items-center justify-between" role="presentation">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-16" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-sm text-red-600 dark:text-red-400 py-4">
          {error instanceof Error ? error.message : 'Failed to load popular posts'}
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post, index) => (
            <Link
              key={post.url}
              href={post.url}
              className="flex items-center justify-between group hover:translate-x-1 transition-transform"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-sm font-medium text-muted-foreground w-6 tabular-nums">
                  {index + 1}
                </span>
                <p className="text-sm text-foreground group-hover:text-primary truncate">
                  {post.title}
                </p>
              </div>
              <span className="text-sm text-muted-foreground ml-4 tabular-nums">
                {post.views.toLocaleString()} views
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
