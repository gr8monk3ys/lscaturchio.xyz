"use client";

import { useEffect } from "react";

interface ReadingProgressTrackerProps {
  slug: string;
  title?: string;
  tags?: string[];
}

type ReadingHistoryEntry = {
  slug: string;
  title?: string;
  tags?: string[];
  lastRead: string;
};

const HISTORY_KEY = "reading_history_v1";

function safeParseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function recordReadingHistory(entry: Omit<ReadingHistoryEntry, "lastRead"> & { lastRead?: string }) {
  const now = entry.lastRead ?? new Date().toISOString();
  const existing = safeParseJson<ReadingHistoryEntry[]>(localStorage.getItem(HISTORY_KEY)) ?? [];

  const next: ReadingHistoryEntry[] = [
    { slug: entry.slug, title: entry.title, tags: entry.tags, lastRead: now },
    ...existing.filter((e) => e && e.slug !== entry.slug),
  ].slice(0, 20);

  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

/**
 * Track reading progress for a blog post
 * Saves scroll progress to localStorage
 */
export function ReadingProgressTracker({ slug, title, tags }: ReadingProgressTrackerProps) {
  useEffect(() => {
    // Record that the user opened this post (used for homepage personalization).
    try {
      recordReadingHistory({ slug, title, tags });
    } catch {
      // Ignore localStorage errors (private mode, disabled storage).
    }

    const progressKey = `reading_progress_${slug}`;
    let ticking = false;

    // Read the stored value once, then track what was last written in memory.
    // This ran `localStorage.getItem` + `JSON.parse` on every animation frame
    // while scrolling (js-cache-storage). `null` means nothing usable is stored.
    let lastSaved: number | null = null;
    try {
      const stored = localStorage.getItem(progressKey);
      if (stored) {
        const data = JSON.parse(stored) as { progress?: number };
        lastSaved = Number(data.progress) || 0;
      }
    } catch {
      lastSaved = null;
    }

    const updateProgress = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;

      // Calculate scroll progress as percentage
      const scrollableHeight = documentHeight - windowHeight;
      const progress = Math.min(
        100,
        Math.max(0, (scrollTop / scrollableHeight) * 100)
      );

      // Only save if progress is > 0 and has changed significantly (> 5%)
      const shouldSave =
        lastSaved === null ? progress > 0 : Math.abs(progress - lastSaved) > 5;

      if (shouldSave) {
        const rounded = Math.round(progress);
        try {
          localStorage.setItem(
            progressKey,
            JSON.stringify({
              progress: rounded,
              lastRead: new Date().toISOString(),
            })
          );
          lastSaved = rounded;
        } catch {
          // Quota exceeded or storage disabled: keep reading, stop saving.
        }
      }

      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateProgress);
        ticking = true;
      }
    };

    // Track scroll
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Initial check
    updateProgress();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [slug, title, tags]);

  // This component doesn't render anything
  return null;
}
