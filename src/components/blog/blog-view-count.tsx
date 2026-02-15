"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { logError } from "@/lib/logger";
import { useViewCounts } from "@/hooks/use-view-counts";

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
  const context = useViewCounts();

  // Always declare state hooks unconditionally (rules of hooks)
  const [fallbackViews, setFallbackViews] = useState<number | null>(null);

  useEffect(() => {
    // Skip individual fetch when context provider is available
    if (context) return;

    const fetchViews = async () => {
      try {
        const response = await fetch(`/api/views?slug=${encodeURIComponent(slug)}`);
        if (response.ok) {
          const json = await response.json();
          setFallbackViews(json.data?.views ?? json.views ?? 0);
        }
      } catch (error) {
        logError("Failed to fetch views", error, { component: "BlogViewCount", slug });
      }
    };

    fetchViews();
  }, [slug, context]);

  // Determine view count from context or fallback
  const views = context ? context.getViewCount(slug) : fallbackViews;

  // While loading (context loading or fallback not yet fetched), render nothing
  if (views === null || views === 0) {
    return null;
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
      <Eye className="h-3 w-3" />
      <span>{views.toLocaleString()}</span>
    </span>
  );
}
