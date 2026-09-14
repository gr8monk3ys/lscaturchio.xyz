"use client"

import { useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import useSWR from 'swr'
import { fetchJson, type ApiEnvelope } from '@/lib/fetcher'
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
      <h2 className="mt-2 text-card-title">
        Connected by idea, not tag
      </h2>
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

  const { data, isLoading, error } = useSWR<ApiEnvelope<{ related?: RelatedPost[] }>>(
    requestUrl,
    fetchJson
  )

  const posts = useMemo(() => {
    const related = data?.data?.related
    return Array.isArray(related) ? related : []
  }, [data])

  // Nothing while it loads, for the same reason the error branch below keeps
  // the section: a reader must never be shown a state they cannot read. Three
  // pulsing cards under a real heading were exactly that with JS off —
  // permanent, and indistinguishable from a section that was still coming.
  // The reserved space is not worth it; this sits at the foot of the essay,
  // where arriving late costs a reader nothing.
  if (isLoading) {
    return null
  }

  // A 429 from the rate limiter used to make this section vanish after
  // hydration — the server had rendered "Connected by idea, not tag" and the
  // client deleted it. Content that arrives and then disappears is worse than
  // content that never came: the reader saw a heading, looked away, and looked
  // back to nothing. Failure keeps the section and says so; genuine emptiness
  // is still nothing, because an essay with no relatives needs no placard.
  if (error) {
    return (
      <section className="mt-12 border-t border-border pt-6" aria-label="Related essays">
        <span className="label-mono">Connected by idea, not tag</span>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Related essays could not be loaded just now. Refreshing usually finds them.
        </p>
      </section>
    )
  }

  if (posts.length === 0) {
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
              className="object-cover"
            />
          </div>
          {post.date && <span className="label-mono mt-4 block">{formatDate(post.date)}</span>}
          {/* `h3`, not `h4`. The section above these is an `h2`, so an `h4`
              skipped a level on all 84 essays — WCAG 1.3.1, and right where a
              reader who just finished an essay is deciding what to read next.
              The level had been chosen for its size: `Heading.tsx` maps
              `h4 -> text-subsection`, so reaching for the smaller type meant
              reaching for the wrong rank. The size class is kept explicitly
              and only the rank changes. */}
          <h3 className="text-subsection mt-2 line-clamp-2 transition-colors group-hover:text-primary">
            {post.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {post.description}
          </p>
        </Link>
      ))}
    </GallerySection>
  )
}
