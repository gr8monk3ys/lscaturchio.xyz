"use client";

import { useEffect } from "react";
import { Eye } from "lucide-react";
import { LazyMotion, domAnimation, m } from '@/lib/motion';
import { logError } from "@/lib/logger";
import { useViewCount } from "@/hooks/use-view-counts";

interface ViewCounterProps {
  slug: string;
}

export function ViewCounter({ slug }: ViewCounterProps) {
  const { viewCount, trackView } = useViewCount(slug);

  useEffect(() => {
    // Check if this post has been viewed in this session
    const viewedKey = `viewed_${slug}`;
    const hasViewed = sessionStorage.getItem(viewedKey);

    const recordView = async () => {
      try {
        // Record view if not already viewed in this session
        if (!hasViewed) {
          await trackView();
          sessionStorage.setItem(viewedKey, "true");
        }
      } catch (error) {
        logError("Failed to record/fetch views", error, { component: "ViewCounter", slug });
      }
    };

    recordView();
  }, [slug, trackView]);

  if (viewCount === null) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground tabular-nums">
        <Eye className="h-4 w-4" />
        <span>---</span>
      </div>
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 text-sm text-muted-foreground tabular-nums"
      >
        <Eye className="h-4 w-4" />
        <span>
          {viewCount.toLocaleString()} {viewCount === 1 ? "view" : "views"}
        </span>
      </m.div>
    </LazyMotion>
  );
}
