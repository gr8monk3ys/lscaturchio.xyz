// Rule: TypeScript Usage - Use TypeScript for all code
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search as SearchIcon, X, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatDate } from "../../../lib/formatDate";
import { SearchResult } from "@/lib/searchUtils";
import Link from "next/link";
import { useTheme } from "@/components/theme/ThemeProvider";
import useSWR from "swr";

// Rule: TypeScript Usage - Use TypeScript for all code with explicit types
const fetcher = async (url: string): Promise<{ results: SearchResult[] }> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Search API failed');
  return res.json();
};

export function SearchDialog(): JSX.Element {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();

  // Handle keyboard shortcut to open search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      
      // Close on escape
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Debounced search
  const { data, error, isLoading } = useSWR(
    query.trim().length > 1 ? `/api/search?q=${encodeURIComponent(query)}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );
  
  // Update results when data changes
  useEffect(() => {
    setIsSearching(isLoading);
    if (data) {
      setResults(data.results);
    } else if (!isLoading) {
      setResults([]);
    }
  }, [data, isLoading]);
  
  // Show error state if search fails
  useEffect(() => {
    if (error) {
      console.error('Search error:', error);
      setIsSearching(false);
    }
  }, [error]);

  // Handle selecting a result
  const handleResultClick = (slug: string) => {
    router.push(`/blog/${slug}`);
    setOpen(false);
    setQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-9 w-9 p-0 justify-center"
          aria-label="Search"
        >
          <SearchIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent 
        className={`sm:max-w-[600px] p-0 gap-0 ${theme === 'dark' ? 'dark' : ''}`}
      >
        <div className="flex items-center border-b dark:border-stone-700">
          <div className="flex w-full items-center px-4">
            <SearchIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search blogs by title, description, or tags..."
              className="flex h-14 w-full bg-transparent py-3 text-sm outline-none placeholder:text-stone-500 disabled:cursor-not-allowed disabled:opacity-50 dark:placeholder:text-stone-400"
              autoFocus
            />
            {query && (
              <X
                className="h-4 w-4 shrink-0 cursor-pointer opacity-50"
                onClick={() => setQuery("")}
              />
            )}
          </div>
        </div>
        <div className="max-h-[70vh] overflow-y-auto">
          {isSearching && (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-stone-500" />
            </div>
          )}
          
          {!isSearching && query && results.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-sm text-stone-500 dark:text-stone-400">
                No results found for &ldquo;<span className="font-medium">{query}</span>&rdquo;
              </p>
            </div>
          )}
          
          {!isSearching && results.length > 0 && (
            <div className="py-2">
              {results.map((result) => (
                <Link
                  key={result.slug}
                  href={`/blog/${result.slug}`}
                  onClick={() => handleResultClick(result.slug)}
                  className="block px-4 py-3 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  <div className="mb-1 text-xs text-stone-500 dark:text-stone-400">
                    {formatDate(result.date)} • {result.tags.join(", ")}
                  </div>
                  <h3 className="text-sm font-medium text-stone-900 dark:text-stone-100">
                    {result.title}
                  </h3>
                  <p className="mt-1 text-xs text-stone-500 dark:text-stone-400 line-clamp-2">
                    {result.excerpt || result.description}
                  </p>
                </Link>
              ))}
            </div>
          )}
          
          {!query && (
            <div className="p-8 text-center">
              <p className="text-sm text-stone-500 dark:text-stone-400">
                Type to search blogs...
              </p>
              <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">
                Press <kbd className="px-1 py-0.5 text-xs border rounded">Esc</kbd> to close
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
