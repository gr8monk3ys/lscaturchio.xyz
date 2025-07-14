// Rule: TypeScript Usage - Use TypeScript for all code
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search as SearchIcon, X, Loader2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useClickOutside } from "@/hooks/use-click-outside";
import { KeyboardShortcut } from "@/components/ui/keyboard-shortcut";

export interface SearchResult {
  title: string;
  excerpt: string;
  url: string;
  category?: string;
  tags?: string[];
  type: "page" | "post" | "project" | "other";
}

interface SearchProps {
  placeholder?: string;
  className?: string;
  fullWidth?: boolean;
  shortcuts?: boolean;
  loadResults?: (query: string) => Promise<SearchResult[]>;
}

export function Search({
  placeholder = "Search...",
  className,
  fullWidth = false,
  shortcuts = true,
  loadResults,
}: SearchProps): JSX.Element {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useClickOutside(containerRef, () => {
    setIsOpen(false);
  });

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+K or / to focus search
      if (
        (event.key === "k" && (event.metaKey || event.ctrlKey)) ||
        (event.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName || ""))
      ) {
        event.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      
      // Escape to close
      if (event.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle navigation with arrow keys when dropdown is open
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((prevIndex) => 
          prevIndex < results.length - 1 ? prevIndex + 1 : prevIndex
        );
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
      } else if (event.key === "Enter" && selectedIndex >= 0) {
        event.preventDefault();
        const selectedResult = results[selectedIndex];
        if (selectedResult) {
          router.push(selectedResult.url);
          setIsOpen(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex, router]);

  // Debounced search
  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        let searchResults: SearchResult[] = [];
        
        if (loadResults) {
          // Use custom result loader if provided
          searchResults = await loadResults(query);
        } else {
          // Default implementation - mock results
          await new Promise(resolve => setTimeout(resolve, 300));
          // This is just a placeholder. In a real implementation,
          // you would fetch results from your API or local data
          searchResults = [
            {
              title: "Sample Blog Post",
              excerpt: `This is a sample result that contains the search query "${query}"...`,
              url: "/blog/sample-post",
              category: "Blog",
              tags: ["sample", "example"],
              type: "post"
            },
            {
              title: "About Page",
              excerpt: "Information about the website and its author...",
              url: "/about",
              type: "page"
            },
          ];
        }
        
        setResults(searchResults);
      } catch (error) {
        console.error("Failed to fetch search results:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timerId = setTimeout(fetchResults, 300);
    return () => clearTimeout(timerId);
  }, [query, loadResults]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative",
        fullWidth ? "w-full" : "w-64",
        className
      )}
    >
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-md border border-stone-300 bg-white py-2 pl-10 pr-4 text-sm text-stone-900 transition-colors placeholder:text-stone-500 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:placeholder:text-stone-400 dark:focus:border-stone-600 dark:focus:ring-stone-600"
          aria-label="Search"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
          <SearchIcon className="h-4 w-4 text-stone-500 dark:text-stone-400" />
        </div>
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            aria-label="Clear search"
          >
            <X className="h-4 w-4 text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200" />
          </button>
        )}
      </div>
      
      {shortcuts && !isOpen && (
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 md:block hidden">
          <KeyboardShortcut keys={["Ctrl", "K"]} size="sm" className="opacity-60" />
        </div>
      )}

      <AnimatePresence>
        {isOpen && (query.length > 0 || isLoading) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-stone-200 bg-white shadow-md dark:border-stone-700 dark:bg-stone-800"
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-stone-500 dark:text-stone-400" />
              </div>
            ) : results.length > 0 ? (
              <div className="max-h-[60vh] overflow-y-auto py-2">
                {results.map((result, index) => (
                  <Link
                    key={`${result.url}-${index}`}
                    href={result.url}
                    onClick={() => setIsOpen(false)}
                  >
                    <div
                      className={cn(
                        "flex cursor-pointer flex-col px-4 py-2 text-sm hover:bg-stone-100 dark:hover:bg-stone-700",
                        selectedIndex === index && "bg-stone-100 dark:bg-stone-700"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-stone-900 dark:text-stone-100">
                          {result.title}
                        </span>
                        {result.category && (
                          <span className="ml-2 rounded bg-stone-100 px-1.5 py-0.5 text-xs font-medium text-stone-600 dark:bg-stone-700 dark:text-stone-300">
                            {result.category}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-stone-600 dark:text-stone-400">
                        {result.excerpt}
                      </p>
                      {result.tags && result.tags.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {result.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600 dark:bg-stone-700 dark:text-stone-300"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : query.length > 0 ? (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  No results found for &quot;{query}&quot;
                </p>
              </div>
            ) : null}
            
            <div className="flex items-center justify-between border-t border-stone-100 bg-stone-50 px-4 py-2 dark:border-stone-700 dark:bg-stone-900">
              <div className="flex gap-2">
                <KeyboardShortcut keys={["↑"]} size="sm" />
                <KeyboardShortcut keys={["↓"]} size="sm" />
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  to navigate
                </span>
              </div>
              <div className="flex items-center">
                <KeyboardShortcut keys={["Enter"]} size="sm" />
                <span className="ml-1 text-xs text-stone-500 dark:text-stone-400">
                  to select
                </span>
              </div>
              <div className="flex items-center">
                <KeyboardShortcut keys={["Esc"]} size="sm" />
                <span className="ml-1 text-xs text-stone-500 dark:text-stone-400">
                  to close
                </span>
              </div>
            </div>
            
            <Link
              href={`/search?q=${encodeURIComponent(query)}`}
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between border-t border-stone-100 bg-stone-50 px-4 py-2 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:hover:bg-stone-800"
            >
              <span className="text-sm font-medium text-stone-900 dark:text-stone-100">
                View all results
              </span>
              <ArrowRight className="h-4 w-4 text-stone-500 dark:text-stone-400" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
