"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Loader2, ArrowUpRight, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import useSWR from "swr";
import { fetchJson, unwrapApiData } from "@/lib/fetcher";

interface SearchResult {
  title: string;
  url: string;
  description: string;
  date: string;
  similarity: number;
  snippets: string[];
}

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debouncedValue;
}

export function SemanticSearchDemo() {
  const [query, setQuery] = useState("RAG systems");
  const debouncedQuery = useDebouncedValue(query, 250).trim();
  const shouldSearch = debouncedQuery.length >= 2;
  const requestUrl = shouldSearch
    ? `/api/search?q=${encodeURIComponent(debouncedQuery)}&limit=6`
    : null;

  const { data, isLoading, error } = useSWR<{ data?: { results?: SearchResult[] }; results?: SearchResult[] }>(
    requestUrl,
    fetchJson,
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
    }
  );

  const results = useMemo(() => {
    if (!data) return [];
    const unwrapped = unwrapApiData(data as { results?: SearchResult[] });
    return Array.isArray(unwrapped.results) ? unwrapped.results : [];
  }, [data]);

  return (
    <section className="neu-card p-6">
      <h3 className="text-xl font-semibold">Semantic Search Demo</h3>
      <p className="text-sm text-muted-foreground mt-1">
        Try a query. Results come from my blog via vector similarity.
      </p>

      <div className="mt-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts..."
            className={cn(
              "w-full rounded-xl pl-10 pr-10 py-3 text-sm",
              "neu-input text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary"
            )}
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 text-sm text-red-600">
          Search is unavailable right now.
        </div>
      )}

      {!error && !isLoading && shouldSearch && results.length === 0 && (
        <div className="mt-4 text-sm text-muted-foreground">
          No results yet. (If embeddings aren&apos;t configured, this may return empty.)
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-5 space-y-3">
          {results.map((r) => (
            <Link
              key={r.url}
              href={r.url}
              className="block rounded-2xl border border-border/60 bg-background/70 p-4 hover:bg-background transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-foreground truncate">
                    {r.title}
                  </div>
                  {r.description && (
                    <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {r.description}
                    </div>
                  )}
                  {r.snippets?.[0] && (
                    <div className="mt-2 text-xs text-muted-foreground/80 italic line-clamp-2">
                      &ldquo;{r.snippets[0]}&rdquo;
                    </div>
                  )}
                  {r.date && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(r.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="ml-2">
                        Similarity: {Math.round((r.similarity || 0) * 100)}%
                      </span>
                    </div>
                  )}
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
