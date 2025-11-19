"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, FileText, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SearchResult {
  slug: string;
  title: string;
  description: string;
  relevance: number;
}

export function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to open
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      // Escape to close
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
      }
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === "Enter" && results[selectedIndex]) {
        e.preventDefault();
        router.push(`/blog/${results[selectedIndex].slug}`);
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex, router]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };

  // Reset state when closing
  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  return (
    <>
      {/* Search trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary transition-colors text-sm text-muted-foreground hover:text-foreground"
        aria-label="Open search"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted text-xs font-mono">
          <span>⌘</span>K
        </kbd>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="w-full max-w-2xl bg-background rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
            >
              {/* Search input */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search blog posts..."
                  className="flex-1 bg-transparent text-lg outline-none placeholder:text-muted-foreground"
                  autoFocus
                />
                {isLoading && (
                  <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-md hover:bg-muted transition-colors"
                  aria-label="Close search"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-96 overflow-y-auto">
                {query && results.length === 0 && !isLoading && (
                  <div className="p-8 text-center text-muted-foreground">
                    No results found for &quot;{query}&quot;
                  </div>
                )}

                {!query && (
                  <div className="p-8 text-center text-muted-foreground">
                    <p>Start typing to search blog posts...</p>
                    <p className="text-xs mt-2">
                      Use ↑↓ to navigate, Enter to open, Esc to close
                    </p>
                  </div>
                )}

                {results.map((result, index) => (
                  <Link
                    key={result.slug}
                    href={`/blog/${result.slug}`}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-start gap-4 px-6 py-4 hover:bg-muted transition-colors ${
                      index === selectedIndex ? "bg-muted" : ""
                    }`}
                  >
                    <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">
                        {result.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {result.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
