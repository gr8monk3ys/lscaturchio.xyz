"use client"

import { useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import useSWR from 'swr'
import { fetchJson, unwrapApiData } from '@/lib/fetcher'
import { formatDate } from '@/lib/formatDate'

interface RelatedPost {
  title: string
  url: string
  description: string
  date: string
  image: string
}

interface RelatedPostsProps {
  currentTitle: string
  currentUrl: string
}

function GallerySection({ children }: { children: React.ReactNode }) {
  return (
    <section className="mt-16 border-t border-border pt-10">
      <span className="label-mono block">Related</span>
      <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight">
        Connected by idea, not tag
      </h3>
      <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </section>
  )
}

export function RelatedPosts({ currentTitle, currentUrl }: RelatedPostsProps) {
  const requestUrl =
    currentTitle && currentUrl
      ? `/api/related-posts?title=${encodeURIComponent(currentTitle)}&url=${encodeURIComponent(currentUrl)}&limit=3`
      : null

  const { data, isLoading, error } = useSWR<{ data?: { related?: RelatedPost[] }; related?: RelatedPost[] }>(
    requestUrl,
    fetchJson
  )

  const posts = useMemo(() => {
    if (!data) return []
    const unwrapped = unwrapApiData(data as { related?: RelatedPost[] })
    return Array.isArray(unwrapped.related) ? unwrapped.related : []
  }, [data])

  if (isLoading) {
    return (
      <GallerySection>
        {[1, 2, 3].map((slot) => (
          <div key={`related-skeleton-${slot}`} className="animate-pulse">
            <div className="aspect-[3/2] border border-border bg-muted" />
            <div className="mt-4 h-3 w-1/3 bg-muted" />
            <div className="mt-2 h-5 w-3/4 bg-muted" />
          </div>
        ))}
      </GallerySection>
    )
  }

  if (error || posts.length === 0) {
    return null
  }

  return (
    <GallerySection>
      {posts.map((post) => (
        <Link key={post.url} href={post.url} className="group block">
          <div className="relative aspect-[3/2] overflow-hidden border border-border bg-muted">
            <Image
              src={post.image}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          </div>
          {post.date && <span className="label-mono mt-4 block">{formatDate(post.date)}</span>}
          <h4 className="mt-2 line-clamp-2 text-lg font-semibold leading-tight tracking-tight transition-colors group-hover:text-primary">
            {post.title}
          </h4>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {post.description}
          </p>
        </Link>
      ))}
    </GallerySection>
  )
}
