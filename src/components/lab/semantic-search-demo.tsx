"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Loader2, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import useSWR from "swr";
import { fetchJson, type ApiEnvelope } from "@/lib/fetcher";
import { stripMarkdown } from "@/lib/strip-markdown";

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

  const { data, isLoading, error } = useSWR<ApiEnvelope<{ results?: SearchResult[] }>>(
    requestUrl,
    fetchJson,
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
    }
  );

  const results = useMemo(() => {
    const found = data?.data?.results;
    return Array.isArray(found) ? found : [];
  }, [data]);

  return (
    <section className="border border-border p-6">
      <h3 className="text-card-title">Semantic search demo</h3>
      {/* `max-w-prose` (65ch), not `max-w-2xl`. 672px of 14px text measures
          about 96 characters per line, well past the 65-75 a reader tracks
          comfortably; the essay body already runs at ~72. A `ch` unit also
          holds that measure if the type scale ever moves, which a px cap
          does not. */}
      <p className="mt-1 max-w-prose text-sm text-muted-foreground">
        Try a query. This is hybrid retrieval over my essays: results are fused
        from vector similarity and keyword search, so a post can rank on meaning,
        on wording, or both. Each result says which one caught it.
      </p>

      <div className="mt-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          {/* A real label. The field had no `id`, no `<label>` and no
              `aria-label`, so its only accessible name was the placeholder —
              which disappears the moment anyone types, leaving a screen-reader
              user with an unnamed text box mid-query. WCAG 1.3.1 and 3.3.2.
              Visually hidden rather than printed, because the section heading
              and the Search glyph already say what this is on screen. */}
          <label htmlFor="lab-semantic-search" className="sr-only">
            Search the essays
          </label>
          <input
            id="lab-semantic-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts..."
            className={cn(
              "w-full rounded-xl pl-10 pr-10 py-3 text-sm",
              "neu-input text-foreground placeholder:text-muted-foreground"
            )}
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 text-sm text-destructive">
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
                  {/* `text-muted-foreground`, not `/80`.
                      The opacity modifier put this at 3.48:1 against Warm Paper
                      in light mode — measured, against a 4.5:1 requirement for
                      12px text. I claimed at the time that this was the only
                      WCAG contrast failure on the site; a later review found
                      code-block line numbers at 2.43:1 in both themes, so the
                      claim was wrong and the sweep that produced it was not a
                      sweep. Full strength is the same token at 5.23:1;
                      the snippet is already distinguished from the description
                      by size and italics, so the extra fade bought nothing and
                      cost compliance. */}
                  {r.snippets?.[0] && (
                    <div className="mt-2 text-xs text-muted-foreground italic line-clamp-2">
                      &ldquo;{stripMarkdown(r.snippets[0])}&rdquo;
                    </div>
                  )}
                  {/* The wall label, like every other date here. This was body
                      sans plus a calendar glyph — the one date on the site not
                      set in the mono voice DESIGN.md assigns to metadata, and
                      an icon doing a label's job. */}
                  {r.date && (
                    <div className="label-mono mt-2 flex items-center gap-2">
                      <span>
                        {new Date(r.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="ml-2">
                        {r.similarity > 0
                          ? `${Math.round(r.similarity * 100)}% vector match`
                          : "keyword match"}
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
