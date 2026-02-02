"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Search,
  FileText,
  Home,
  User,
  Briefcase,
  Mail,
  Moon,
  Sun,
  MessageSquare,
  X,
  ArrowRight,
  BookOpen,
  Sparkles,
  Loader2,
  Bookmark,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { safeStorage } from "@/lib/storage";

interface CommandItem {
  id: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
  category: "navigation" | "blog" | "action" | "search";
  action: () => void;
  keywords?: string[];
}

interface SearchResult {
  slug: string;
  title: string;
  description: string;
  relevance: number;
  date: string;
  tags: string[];
}

interface CommandPaletteProps {
  className?: string;
}

export function CommandPalette({ className }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [, setRecentSearches] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = safeStorage.getJSON<string[]>("command-palette-recent");
    if (saved) {
      setRecentSearches(saved);
    }
  }, []);

  // Save search to recent
  const saveRecentSearch = useCallback((search: string) => {
    if (!search.trim()) return;
    setRecentSearches((prev) => {
      const updated = [search, ...prev.filter((s) => s !== search)].slice(0, 5);
      safeStorage.setJSON("command-palette-recent", updated);
      return updated;
    });
  }, []);

  // Perform API search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results || []);
      }
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch(query);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  // Navigation commands
  const navigationCommands: CommandItem[] = useMemo(
    () => [
      {
        id: "home",
        title: "Home",
        description: "Go to homepage",
        icon: <Home className="h-4 w-4" />,
        category: "navigation",
        action: () => router.push("/"),
        keywords: ["main", "index", "start"],
      },
      {
        id: "about",
        title: "About",
        description: "Learn more about me",
        icon: <User className="h-4 w-4" />,
        category: "navigation",
        action: () => router.push("/about"),
        keywords: ["bio", "profile", "me"],
      },
      {
        id: "projects",
        title: "Projects",
        description: "View my portfolio projects",
        icon: <Briefcase className="h-4 w-4" />,
        category: "navigation",
        action: () => router.push("/projects"),
        keywords: ["work", "portfolio", "showcase"],
      },
      {
        id: "blog",
        title: "Blog",
        description: "Read my articles",
        icon: <BookOpen className="h-4 w-4" />,
        category: "navigation",
        action: () => router.push("/blog"),
        keywords: ["articles", "posts", "writing"],
      },
      {
        id: "series",
        title: "Series",
        description: "Browse blog series",
        icon: <TrendingUp className="h-4 w-4" />,
        category: "navigation",
        action: () => router.push("/series"),
        keywords: ["collection", "tutorials"],
      },
      {
        id: "contact",
        title: "Contact",
        description: "Get in touch",
        icon: <Mail className="h-4 w-4" />,
        category: "navigation",
        action: () => router.push("/contact"),
        keywords: ["email", "message", "reach"],
      },
      {
        id: "chat",
        title: "AI Chat",
        description: "Chat with my AI assistant",
        icon: <MessageSquare className="h-4 w-4" />,
        category: "navigation",
        action: () => router.push("/chat"),
        keywords: ["ai", "assistant", "help", "gpt"],
      },
      {
        id: "bookmarks",
        title: "Bookmarks",
        description: "View saved posts",
        icon: <Bookmark className="h-4 w-4" />,
        category: "navigation",
        action: () => router.push("/bookmarks"),
        keywords: ["saved", "favorites", "later"],
      },
    ],
    [router]
  );

  // Action commands
  const actionCommands: CommandItem[] = useMemo(
    () => [
      {
        id: "toggle-theme",
        title: theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode",
        description: "Toggle theme appearance",
        icon: theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />,
        category: "action",
        action: () => {
          setTheme(theme === "dark" ? "light" : "dark");
          setIsOpen(false);
        },
        keywords: ["theme", "dark", "light", "mode", "appearance"],
      },
    ],
    [theme, setTheme]
  );

  // Blog search results as commands
  const blogCommands: CommandItem[] = useMemo(
    () =>
      searchResults.map((result) => ({
        id: `blog-${result.slug}`,
        title: result.title,
        description: result.description,
        icon: <FileText className="h-4 w-4" />,
        category: "blog" as const,
        action: () => {
          saveRecentSearch(result.title);
          router.push(`/blog/${result.slug}`);
        },
        keywords: result.tags || [],
      })),
    [searchResults, router, saveRecentSearch]
  );

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) {
      // Show navigation and actions by default
      return [...navigationCommands, ...actionCommands];
    }

    const lowerQuery = query.toLowerCase();

    // Filter navigation and action commands
    const filteredNav = [...navigationCommands, ...actionCommands].filter((cmd) => {
      const titleMatch = cmd.title.toLowerCase().includes(lowerQuery);
      const descMatch = cmd.description?.toLowerCase().includes(lowerQuery);
      const keywordMatch = cmd.keywords?.some((k) => k.toLowerCase().includes(lowerQuery));
      return titleMatch || descMatch || keywordMatch;
    });

    // Add blog search results
    return [...filteredNav, ...blogCommands];
  }, [query, navigationCommands, actionCommands, blogCommands]);

  // Keyboard handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Open with Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }

      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          setIsOpen(false);
          setQuery("");
          setSearchResults([]);
          break;
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
            setIsOpen(false);
            setQuery("");
            setSearchResults([]);
          }
          break;
      }
    },
    [isOpen, filteredCommands, selectedIndex]
  );

  // Add keyboard listener
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Reset selected index when commands change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCommands.length]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Reset state when closing
  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setSearchResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current && filteredCommands.length > 0) {
      const selectedElement = listRef.current.querySelector(
        `[data-index="${selectedIndex}"]`
      );
      selectedElement?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex, filteredCommands.length]);

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {
      navigation: [],
      action: [],
      blog: [],
    };

    filteredCommands.forEach((cmd) => {
      groups[cmd.category].push(cmd);
    });

    return groups;
  }, [filteredCommands]);

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "navigation":
        return "Pages";
      case "action":
        return "Actions";
      case "blog":
        return "Blog Posts";
      default:
        return category;
    }
  };

  let globalIndex = -1;

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground",
          "bg-muted/50 hover:bg-muted rounded-lg border border-border/50 transition-colors",
          className
        )}
        aria-label="Open command palette"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            />

            {/* Command Palette */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.15 }}
              className="fixed left-1/2 top-[20%] -translate-x-1/2 w-full max-w-xl z-50 px-4"
            >
              <div className="bg-popover border border-border rounded-xl shadow-2xl overflow-hidden">
                {/* Search Input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                  <Search className="h-5 w-5 text-muted-foreground shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search pages, blogs, or actions..."
                    className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
                  />
                  {isSearching && (
                    <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                  )}
                  {query && !isSearching && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("");
                        setSearchResults([]);
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <kbd className="hidden sm:inline-flex h-5 items-center rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                    ESC
                  </kbd>
                </div>

                {/* Results */}
                <div
                  ref={listRef}
                  className="max-h-[60vh] overflow-y-auto p-2"
                  role="listbox"
                >
                  {filteredCommands.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                      <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No results found for &quot;{query}&quot;</p>
                      <p className="text-sm mt-1">Try searching for something else</p>
                    </div>
                  ) : (
                    Object.entries(groupedCommands).map(([category, commands]) => {
                      if (commands.length === 0) return null;

                      return (
                        <div key={category} className="mb-2">
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {getCategoryLabel(category)}
                          </div>
                          {commands.map((cmd) => {
                            globalIndex++;
                            const isSelected = globalIndex === selectedIndex;

                            return (
                              <button
                                key={cmd.id}
                                type="button"
                                data-index={globalIndex}
                                onClick={() => {
                                  cmd.action();
                                  setIsOpen(false);
                                  setQuery("");
                                  setSearchResults([]);
                                }}
                                onMouseEnter={() => setSelectedIndex(globalIndex)}
                                className={cn(
                                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                                  isSelected
                                    ? "bg-primary/10 text-foreground"
                                    : "text-muted-foreground hover:bg-muted"
                                )}
                                role="option"
                                aria-selected={isSelected}
                              >
                                <div
                                  className={cn(
                                    "shrink-0 p-1.5 rounded-md",
                                    isSelected ? "bg-primary/20" : "bg-muted"
                                  )}
                                >
                                  {cmd.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-foreground truncate">
                                    {cmd.title}
                                  </div>
                                  {cmd.description && (
                                    <div className="text-sm text-muted-foreground truncate">
                                      {cmd.description}
                                    </div>
                                  )}
                                </div>
                                {isSelected && (
                                  <ArrowRight className="h-4 w-4 shrink-0 text-primary" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2 border-t border-border bg-muted/30">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 rounded border bg-muted font-mono">↑↓</kbd>
                        navigate
                      </span>
                      <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 rounded border bg-muted font-mono">↵</kbd>
                        select
                      </span>
                    </div>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 rounded border bg-muted font-mono">esc</kbd>
                      close
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// Hook to open command palette programmatically
export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, open, close, toggle, setIsOpen };
}
