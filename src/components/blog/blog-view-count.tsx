"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { logError } from "@/lib/logger";

interface BlogViewCountProps {
  slug: string;
}

/**
 * Display-only view counter for blog cards
 * Unlike ViewCounter, this only fetches and displays - it doesn't increment
 */
export function BlogViewCount({ slug }: BlogViewCountProps) {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    const fetchViews = async () => {
      try {
        const response = await fetch(`/api/views?slug=${encodeURIComponent(slug)}`);
        if (response.ok) {
          const json = await response.json();
          setViews(json.data?.views ?? json.views ?? 0);
        }
      } catch (error) {
        logError("Failed to fetch views", error, { component: "BlogViewCount", slug });
      }
    };

    fetchViews();
  }, [slug]);

  if (views === null || views === 0) {
    return null; // Don't show if no views yet
  }

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <Eye className="h-3 w-3" />
      <span>{views.toLocaleString()}</span>
    </div>
  );
}
