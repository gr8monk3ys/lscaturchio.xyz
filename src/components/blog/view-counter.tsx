"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { motion } from "framer-motion";

interface ViewCounterProps {
  slug: string;
}

export function ViewCounter({ slug }: ViewCounterProps) {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    // Check if this post has been viewed in this session
    const viewedKey = `viewed_${slug}`;
    const hasViewed = sessionStorage.getItem(viewedKey);

    const recordView = async () => {
      try {
        // Record view if not already viewed in this session
        if (!hasViewed) {
          await fetch("/api/views", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slug }),
          });
          sessionStorage.setItem(viewedKey, "true");
        }

        // Fetch current view count
        const response = await fetch(`/api/views?slug=${encodeURIComponent(slug)}`);
        if (response.ok) {
          const data = await response.json();
          setViews(data.views);
        }
      } catch (error) {
        console.error("Failed to record/fetch views:", error);
      }
    };

    recordView();
  }, [slug]);

  if (views === null) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Eye className="h-4 w-4" />
        <span>---</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2 text-sm text-muted-foreground"
    >
      <Eye className="h-4 w-4" />
      <span>
        {views.toLocaleString()} {views === 1 ? "view" : "views"}
      </span>
    </motion.div>
  );
}
