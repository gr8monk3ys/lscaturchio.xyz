"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, FileText, X, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

interface SearchResult {
  slug: string;
  title: string;
  description: string;
  relevance: number;
  date: string;
  tags: string[];
}

type SortOption = "relevance" | "date-desc" | "date-asc" | "alphabetical";

export function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();

  // Get all unique tags from results
  const availableTags = Array.from(
    new Set(results.flatMap((r) => r.tags))
  ).slice(0, 10); // Limit to 10 tags

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
          prev < filteredResults.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === "Enter" && filteredResults[selectedIndex]) {
        e.preventDefault();
        router.push(`/blog/${filteredResults[selectedIndex].slug}`);
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredResults, selectedIndex, router]);

  // Filter and sort results
  useEffect(() => {
    let filtered = [...results];

    // Apply tag filter
    if (selectedTag) {
      filtered = filtered.filter((r) => r.tags.includes(selectedTag));
    }

    // Apply sorting
    switch (sortBy) {
      case "date-desc":
        filtered.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        break;
      case "date-asc":
        filtered.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        break;
      case "alphabetical":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "relevance":
      default:
        filtered.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));
        break;
    }

    setFilteredResults(filtered);
  }, [results, selectedTag, sortBy]);

  // Reset selection when filtered results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredResults]);

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
      setFilteredResults([]);
      setSelectedIndex(0);
      setSelectedTag(null);
      setSortBy("relevance");
      setShowFilters(false);
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

              {/* Filters */}
              {results.length > 0 && (
                <div className="border-b border-gray-200 dark:border-gray-800 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                      {showFilters ? "Hide" : "Show"} Filters
                    </button>
                    <span className="text-xs text-muted-foreground">
                      {filteredResults.length} result
                      {filteredResults.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {showFilters && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3"
                    >
                      {/* Sort Options */}
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-2 block">
                          Sort by
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { value: "relevance", label: "Relevance" },
                            { value: "date-desc", label: "Newest" },
                            { value: "date-asc", label: "Oldest" },
                            { value: "alphabetical", label: "A-Z" },
                          ].map((option) => (
                            <button
                              key={option.value}
                              onClick={() =>
                                setSortBy(option.value as SortOption)
                              }
                              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                sortBy === option.value
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-secondary hover:bg-secondary/80"
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Tag Filter */}
                      {availableTags.length > 0 && (
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-2 block">
                            Filter by tag
                          </label>
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => setSelectedTag(null)}
                              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                !selectedTag
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-secondary hover:bg-secondary/80"
                              }`}
                            >
                              All
                            </button>
                            {availableTags.map((tag) => (
                              <button
                                key={tag}
                                onClick={() => setSelectedTag(tag)}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                  selectedTag === tag
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-secondary hover:bg-secondary/80"
                                }`}
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              )}

              {/* Results */}
              <div className="max-h-96 overflow-y-auto">
                {query && filteredResults.length === 0 && !isLoading && (
                  <div className="p-8 text-center text-muted-foreground">
                    {selectedTag
                      ? `No results found for "${query}" with tag "${selectedTag}"`
                      : `No results found for "${query}"`}
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

                {filteredResults.map((result, index) => (
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
                      {result.tags && result.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {result.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
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
