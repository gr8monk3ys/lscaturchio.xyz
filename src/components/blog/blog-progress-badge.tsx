"use client";

import { useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { useIsClient } from "@/hooks/use-is-client";
import { safeStorage } from "@/lib/storage";

interface BlogProgressBadgeProps {
  slug: string;
}

/**
 * Helper to get reading progress from localStorage
 */
function getStoredProgress(slug: string): number {
  const progressKey = `reading_progress_${slug}`;
  const data = safeStorage.getJSON<{ progress?: number }>(progressKey);
  return data?.progress || 0;
}

/**
 * Display reading progress badge on blog cards
 * Shows if a post has been read (>= 90%), partially read (> 0%), or unread
 */
export function BlogProgressBadge({ slug }: BlogProgressBadgeProps) {
  const isClient = useIsClient();
  // Only read localStorage on the client side
  const [progress] = useState<number>(() => isClient ? getStoredProgress(slug) : 0);

  // Don't show anything if no progress
  if (progress === 0) {
    return null;
  }

  // Post is considered "read" if >= 90% scrolled
  const isRead = progress >= 90;

  return (
    <div
      className={`absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
        isRead
          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
          : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
      }`}
    >
      {isRead ? (
        <>
          <CheckCircle2 className="h-3 w-3" />
          <span>Read</span>
        </>
      ) : (
        <>
          <Circle className="h-3 w-3" />
          <span>{Math.round(progress)}%</span>
        </>
      )}
    </div>
  );
}
