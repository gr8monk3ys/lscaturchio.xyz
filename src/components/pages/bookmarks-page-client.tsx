"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, Trash2, ExternalLink, ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { Paragraph } from "@/components/Paragraph";
import { Button } from "@/components/ui/button";
import { FallbackImage } from "@/components/ui/fallback-image";
import { useIsClient } from "@/hooks/use-is-client";
import { safeStorage } from "@/lib/storage";

interface BookmarkedPost {
  slug: string;
  title: string;
  description: string;
  image?: string;
  date: string;
  bookmarkedAt: number;
}

/**
 * Load bookmarks from localStorage (safe to call during SSR)
 */
function loadBookmarksFromStorage(): BookmarkedPost[] {
  const stored = safeStorage.getJSON<BookmarkedPost[]>("blog-bookmarks");
  if (stored) {
    // Sort by most recently bookmarked
    return stored.sort(
      (a: BookmarkedPost, b: BookmarkedPost) => b.bookmarkedAt - a.bookmarkedAt
    );
  }
  return [];
}

export function BookmarksPageClient() {
  const isClient = useIsClient();

  // Load bookmarks from localStorage using initializer (only runs on client)
  const [bookmarks, setBookmarks] = useState<BookmarkedPost[]>(() => loadBookmarksFromStorage());

  // Capture initial time on first client render via useState initializer
  const [currentTime] = useState<number | null>(() => (typeof window !== "undefined" ? Date.now() : null));

  // Remove a bookmark
  const removeBookmark = (slug: string) => {
    const updated = bookmarks.filter((b) => b.slug !== slug);
    setBookmarks(updated);
    safeStorage.setJSON("blog-bookmarks", updated);

    // Also update the individual blog's reaction state
    const reactionKey = `blog-reactions-${slug}`;
    const storedReactions = safeStorage.getJSON<{ bookmarked?: boolean }>(reactionKey);
    if (storedReactions) {
      storedReactions.bookmarked = false;
      safeStorage.setJSON(reactionKey, storedReactions);
    }
  };

  // Clear all bookmarks
  const clearAllBookmarks = () => {
    // Clear each individual reaction state
    bookmarks.forEach((bookmark) => {
      const reactionKey = `blog-reactions-${bookmark.slug}`;
      const storedReactions = safeStorage.getJSON<{ bookmarked?: boolean }>(reactionKey);
      if (storedReactions) {
        storedReactions.bookmarked = false;
        safeStorage.setJSON(reactionKey, storedReactions);
      }
    });

    setBookmarks([]);
    safeStorage.setJSON("blog-bookmarks", []);
  };

  // Export bookmarks as JSON
  const exportBookmarks = () => {
    const dataStr = JSON.stringify(bookmarks, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const exportFileName = `bookmarks-${new Date().toISOString().split("T")[0]}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileName);
    linkElement.click();
  };

  // Format date
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Format relative time - uses currentTime state instead of Date.now() to avoid impure render
  const formatRelativeTime = useMemo(() => {
    return (timestamp: number) => {
      if (!currentTime) return formatDate(new Date(timestamp).toISOString());
      const seconds = Math.floor((currentTime - timestamp) / 1000);

      if (seconds < 60) return "Just now";
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
      if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
      if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
      return formatDate(new Date(timestamp).toISOString());
    };
  }, [currentTime]);

  if (!isClient) {
    return (
      <Container>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-pulse text-muted-foreground">Loading bookmarks...</div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>
            <Heading as="h1" className="flex items-center gap-3">
              <Bookmark className="h-8 w-8 text-primary" />
              My Bookmarks
            </Heading>
            <Paragraph className="mt-2 text-muted-foreground">
              {bookmarks.length === 0
                ? "You haven't bookmarked any posts yet."
                : `${bookmarks.length} saved post${bookmarks.length === 1 ? "" : "s"}`}
            </Paragraph>
          </div>

          {bookmarks.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportBookmarks}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllBookmarks}
                className="gap-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Clear All
              </Button>
            </div>
          )}
        </div>

        {/* Empty State */}
        {bookmarks.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="p-4 rounded-full bg-muted mb-6">
              <Bookmark className="h-12 w-12 text-muted-foreground" />
            </div>
            <Heading as="h3" className="mb-2">
              No bookmarks yet
            </Heading>
            <Paragraph className="text-muted-foreground max-w-md">
              When you find articles you want to read later, click the bookmark icon to save
              them here.
            </Paragraph>
            <Link href="/blog">
              <Button className="mt-6">Browse Articles</Button>
            </Link>
          </motion.div>
        )}

        {/* Bookmarks Grid */}
        <AnimatePresence mode="popLayout">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bookmarks.map((bookmark, index) => (
              <motion.article
                key={bookmark.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="group relative rounded-xl border border-border bg-card overflow-hidden hover:border-primary/50 transition-colors"
              >
                {/* Image */}
                <Link href={`/blog/${bookmark.slug}`}>
                  <div className="relative h-40 overflow-hidden">
                    <FallbackImage
                      src={bookmark.image || "/images/blog/default.webp"}
                      alt={bookmark.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                  </div>
                </Link>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/blog/${bookmark.slug}`} className="flex-1">
                      <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                        {bookmark.title}
                      </h3>
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeBookmark(bookmark.slug)}
                      className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Remove bookmark"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                    {bookmark.description}
                  </p>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
                    <span>{formatDate(bookmark.date)}</span>
                    <span>Saved {formatRelativeTime(bookmark.bookmarkedAt)}</span>
                  </div>
                </div>

                {/* Read Link */}
                <Link
                  href={`/blog/${bookmark.slug}`}
                  className="absolute bottom-4 right-4 p-2 rounded-full bg-primary/10 text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Read article"
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </motion.article>
            ))}
          </div>
        </AnimatePresence>

        {/* Tips Section */}
        {bookmarks.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 p-6 rounded-xl bg-muted/30 border border-border"
          >
            <h3 className="font-semibold mb-2">💡 Tips</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Bookmarks are stored locally in your browser</li>
              <li>• Use the Export button to save your bookmarks</li>
              <li>• Press <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">⌘K</kbd> to quickly search your bookmarks</li>
            </ul>
          </motion.div>
        )}
      </div>
    </Container>
  );
}
