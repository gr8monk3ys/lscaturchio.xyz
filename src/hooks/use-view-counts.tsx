"use client";

import { createContext, useContext, useCallback, ReactNode } from "react";
import useSWR from "swr";
import { fetchJson, unwrapApiData } from "@/lib/fetcher";

interface ViewCountsContextType {
  viewCounts: Record<string, number>;
  isLoading: boolean;
  getViewCount: (slug: string) => number | null;
  trackView: (slug: string) => Promise<void>;
}

const ViewCountsContext = createContext<ViewCountsContextType | null>(null);

type ViewRow = { slug: string; views: number };
type ViewsEnvelope = { data?: { views?: ViewRow[] }; views?: ViewRow[] };

function extractViewRows(payload: unknown): ViewRow[] {
  const data = unwrapApiData(payload as { views?: ViewRow[] });
  const rows = (data as { views?: ViewRow[] }).views;
  return Array.isArray(rows) ? rows : [];
}

function extractSingleViewCount(payload: unknown): number {
  const data = unwrapApiData(payload as { views?: number });
  const views = (data as { views?: number }).views;
  return typeof views === "number" ? views : 0;
}

/**
 * Provider that batch-fetches all view counts at once to prevent N+1 API calls
 * Use this at the layout level to provide view counts to all blog cards
 */
export function ViewCountsProvider({ children }: { children: ReactNode }) {
  const {
    data: viewCounts = {},
    isLoading,
    mutate,
  } = useSWR<Record<string, number>>("/api/views?all=true", async (url: string) => {
    const payload = await fetchJson<ViewsEnvelope>(url);
    const rows = extractViewRows(payload);
    return rows.reduce<Record<string, number>>((acc, row) => {
      acc[row.slug] = row.views;
      return acc;
    }, {});
  });

  const getViewCount = useCallback(
    (slug: string): number | null => {
      if (isLoading) return null;
      return viewCounts[slug] ?? 0;
    },
    [viewCounts, isLoading]
  );

  const trackView = useCallback(async (slug: string) => {
    try {
      const payload = await fetchJson<{ data?: { views?: number }; views?: number }>("/api/views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const views = extractSingleViewCount(payload);
      await mutate((previous = {}) => ({ ...previous, [slug]: views }), {
        revalidate: false,
      });
    } catch {
      // Silently fail
    }
  }, [mutate]);

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
  const {
    data: fallbackCount,
    isLoading: fallbackLoading,
    mutate: mutateFallbackCount,
  } = useSWR<number>(
    hasContext ? null : `/api/views?slug=${encodeURIComponent(slug)}`,
    async (url: string) => {
      const payload = await fetchJson<{ data?: { views?: number }; views?: number }>(url);
      return extractSingleViewCount(payload);
    }
  );

  const trackFallbackView = useCallback(async () => {
    try {
      const payload = await fetchJson<{ data?: { views?: number }; views?: number }>("/api/views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const views = extractSingleViewCount(payload);
      await mutateFallbackCount(views, { revalidate: false });
    } catch {
      // Silently fail
    }
  }, [slug, mutateFallbackCount]);

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
    viewCount: fallbackCount ?? null,
    isLoading: fallbackLoading,
    trackView: trackFallbackView,
  };
}
