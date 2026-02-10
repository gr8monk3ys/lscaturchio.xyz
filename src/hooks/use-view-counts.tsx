"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

interface ViewCountsContextType {
  viewCounts: Record<string, number>;
  isLoading: boolean;
  getViewCount: (slug: string) => number | null;
  trackView: (slug: string) => Promise<void>;
}

const ViewCountsContext = createContext<ViewCountsContextType | null>(null);

/**
 * Provider that batch-fetches all view counts at once to prevent N+1 API calls
 * Use this at the layout level to provide view counts to all blog cards
 */
export function ViewCountsProvider({ children }: { children: ReactNode }) {
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Batch fetch all view counts on mount
  useEffect(() => {
    const fetchAllViews = async () => {
      try {
        const response = await fetch("/api/views?all=true");
        if (response.ok) {
          const json = await response.json();
          // apiSuccess wraps as { data: { views: [...] }, success: true }
          const views = json.data?.views ?? json.views ?? [];
          const counts: Record<string, number> = {};
          views.forEach((view: { slug: string; views: number }) => {
            counts[view.slug] = view.views;
          });
          setViewCounts(counts);
        }
      } catch {
        // Silently fail - view counts are non-critical
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllViews();
  }, []);

  const getViewCount = useCallback(
    (slug: string): number | null => {
      if (isLoading) return null;
      return viewCounts[slug] ?? 0;
    },
    [viewCounts, isLoading]
  );

  const trackView = useCallback(async (slug: string) => {
    try {
      const response = await fetch("/api/views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (response.ok) {
        const json = await response.json();
        const views = json.data?.views ?? json.views ?? 0;
        setViewCounts((prev) => ({
          ...prev,
          [slug]: views,
        }));
      }
    } catch {
      // Silently fail
    }
  }, []);

  return (
    <ViewCountsContext.Provider value={{ viewCounts, isLoading, getViewCount, trackView }}>
      {children}
    </ViewCountsContext.Provider>
  );
}

/**
 * Hook to access batched view counts
 * Returns null if used outside provider
 */
export function useViewCounts() {
  const context = useContext(ViewCountsContext);
  return context;
}

/**
 * Hook to get a single view count, with fallback to individual fetch
 * All hooks called unconditionally to follow rules of hooks
 */
export function useViewCount(slug: string) {
  const context = useViewCounts();
  const hasContext = context !== null;

  // Always declare state (rules of hooks)
  const [fallbackCount, setFallbackCount] = useState<number | null>(null);
  const [fallbackLoading, setFallbackLoading] = useState(true);

  // Always call useEffect, but conditionally execute logic inside
  useEffect(() => {
    // Skip if using context provider
    if (hasContext) {
      return;
    }

    const fetchView = async () => {
      try {
        const response = await fetch(`/api/views?slug=${encodeURIComponent(slug)}`);
        if (response.ok) {
          const data = await response.json();
          setFallbackCount(data.views);
        }
      } catch {
        // Silently fail
      } finally {
        setFallbackLoading(false);
      }
    };

    fetchView();
  }, [slug, hasContext]);

  // Return context-based values if available
  if (context) {
    return {
      viewCount: context.getViewCount(slug),
      isLoading: context.isLoading,
      trackView: () => context.trackView(slug),
    };
  }

  // Return fallback values
  return {
    viewCount: fallbackCount,
    isLoading: fallbackLoading,
    trackView: async () => {
      try {
        const response = await fetch("/api/views", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug }),
        });
        if (response.ok) {
          const data = await response.json();
          setFallbackCount(data.views);
        }
      } catch {
        // Silently fail
      }
    },
  };
}
