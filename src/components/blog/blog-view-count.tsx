"use client";

import { Eye } from "lucide-react";
import { useViewCount } from "@/hooks/use-view-counts";

interface BlogViewCountProps {
  slug: string;
}

/**
 * Display-only view counter for blog cards.
 *
 * When rendered inside a ViewCountsProvider (e.g. the blog listing page),
 * reads from the batched context to avoid N+1 individual API calls.
 * Falls back to an individual fetch when no provider is present.
 */
export function BlogViewCount({ slug }: BlogViewCountProps) {
  const { viewCount } = useViewCount(slug);

  // While loading (context loading or fallback not yet fetched), render nothing
  if (viewCount === null || viewCount === 0) {
    return null;
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
      <Eye className="h-3 w-3" />
      <span>{viewCount.toLocaleString()}</span>
    </span>
  );
}
