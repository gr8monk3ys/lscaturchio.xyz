"use client";

import Link from "next/link";
import useSWR from "swr";
import { fetchJson, type ApiEnvelope } from "@/lib/fetcher";
import { cn } from "@/lib/utils";

interface SeriesPost {
  slug: string;
  title: string;
  seriesOrder: number;
}

interface SeriesNavigationProps {
  seriesName: string;
  currentSlug: string;
  currentOrder: number;
}

/**
 * Series ledger: where this essay sits in its series, and the neighbours.
 * Hairline rows on the paper, not a tinted card.
 */
export function SeriesNavigation({
  seriesName,
  currentSlug,
  currentOrder,
}: SeriesNavigationProps) {
  const requestUrl = `/api/series?name=${encodeURIComponent(seriesName)}`;
  const { data, isLoading } = useSWR<ApiEnvelope<{ posts?: SeriesPost[] }>>(requestUrl, fetchJson, {
    revalidateOnFocus: false,
  });
  const seriesPosts = Array.isArray(data?.data?.posts) ? data.data.posts : [];

  if (isLoading) {
    return (
      <div className="mt-8 h-32 animate-pulse border-t border-border bg-muted/40" aria-hidden />
    );
  }

  if (seriesPosts.length === 0) {
    return null;
  }

  const currentIndex = seriesPosts.findIndex(
    (post) => post.slug === currentSlug
  );
  const prevPost = currentIndex > 0 ? seriesPosts[currentIndex - 1] : null;
  const nextPost =
    currentIndex < seriesPosts.length - 1
      ? seriesPosts[currentIndex + 1]
      : null;

  return (
    <section className="mt-8 border-t border-border pt-6" aria-label="Series">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="label-mono">
          Series · <span>{`Part ${currentOrder} of ${seriesPosts.length}`}</span>
        </span>
        <h3 className="font-display text-lg font-semibold tracking-tight">
          {seriesName} Series
        </h3>
      </div>

      <ol className="mt-4 border-t border-border">
        {seriesPosts.map((post) => {
          const isCurrent = post.slug === currentSlug;
          return (
            <li
              key={post.slug}
              className="grid grid-cols-[2.5rem_1fr] items-baseline gap-x-3 border-b border-border py-2.5"
            >
              <span className="label-mono tabular-nums">{post.seriesOrder}.</span>
              {isCurrent ? (
                <span className="text-sm font-medium text-primary" aria-current="page">
                  {post.title} (current)
                </span>
              ) : (
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-sm text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                >
                  {post.title}
                </Link>
              )}
            </li>
          );
        })}
      </ol>

      {(prevPost || nextPost) && (
        <div className="mt-4 flex flex-wrap justify-between gap-x-6 gap-y-2">
          {prevPost ? (
            <Link
              href={`/blog/${prevPost.slug}`}
              className={cn(
                "label-mono min-w-0 text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
              )}
            >
              <span className="text-muted-foreground">← </span>
              <span className="sr-only">Previous</span>
              <span aria-hidden className="normal-case tracking-normal">Previous · {prevPost.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {nextPost && (
            <Link
              href={`/blog/${nextPost.slug}`}
              className="label-mono min-w-0 text-right text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
            >
              <span className="sr-only">Next</span>
              <span aria-hidden className="normal-case tracking-normal">Next · {nextPost.title}</span>
              <span className="text-muted-foreground"> →</span>
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
