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
      const stored = localStorage.getItem(progressKey);
      let shouldSave = false;

      if (!stored) {
        shouldSave = progress > 0;
      } else {
        try {
          const data = JSON.parse(stored);
          const diff = Math.abs(progress - (data.progress || 0));
          shouldSave = diff > 5; // Save every 5% change
        } catch {
          shouldSave = progress > 0;
        }
      }

      if (shouldSave) {
        localStorage.setItem(
          progressKey,
          JSON.stringify({
            progress: Math.round(progress),
            lastRead: new Date().toISOString(),
          })
        );
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
