"use client";

import { useState, useEffect } from "react";
import { Heart, Bookmark, TrendingUp } from "lucide-react";
import { logError } from "@/lib/logger";

interface EngagementData {
  totalLikes: number;
  totalBookmarks: number;
  topLiked: { slug: string; title: string; likes: number }[];
  topBookmarked: { slug: string; title: string; bookmarks: number }[];
}

export function EngagementStats() {
  const [data, setData] = useState<EngagementData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEngagement = async () => {
      try {
        const response = await fetch("/api/engagement-stats");
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        logError("Failed to fetch engagement stats", error, { component: "EngagementStats" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEngagement();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-800" aria-busy="true" aria-label="Loading engagement statistics">
        <div className="flex items-center gap-2 mb-6">
          <Heart className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold">Engagement</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse h-16 bg-muted rounded" role="presentation" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-6">
          <Heart className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold">Engagement</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          No engagement data yet. Be the first to react!
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="text-xl font-semibold">Engagement</h3>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Total Likes */}
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="h-5 w-5 text-red-600 dark:text-red-400 fill-current" />
            <span className="text-sm font-medium text-red-600 dark:text-red-400">
              Total Likes
            </span>
          </div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {data.totalLikes.toLocaleString()}
          </p>
        </div>

        {/* Total Bookmarks */}
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Bookmark className="h-5 w-5 text-primary fill-current" />
            <span className="text-sm font-medium text-primary">
              Total Bookmarks
            </span>
          </div>
          <p className="text-2xl font-bold text-primary">
            {data.totalBookmarks.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Top Liked Posts */}
      {data.topLiked.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-muted-foreground mb-3">
            Most Liked
          </h4>
          <div className="space-y-2">
            {data.topLiked.slice(0, 3).map((post, index) => (
              <a
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="flex items-center justify-between group hover:translate-x-1 transition-transform p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-950/10"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-xs font-medium text-muted-foreground w-4">
                    {index + 1}
                  </span>
                  <p className="text-sm text-foreground group-hover:text-red-600 dark:group-hover:text-red-400 truncate">
                    {post.title}
                  </p>
                </div>
                <span className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400 ml-4">
                  <Heart className="h-3 w-3 fill-current" />
                  {post.likes}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Top Bookmarked Posts */}
      {data.topBookmarked.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground mb-3">
            Most Bookmarked
          </h4>
          <div className="space-y-2">
            {data.topBookmarked.slice(0, 3).map((post, index) => (
              <a
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="flex items-center justify-between group hover:translate-x-1 transition-transform p-2 rounded-md hover:bg-primary/10"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-xs font-medium text-muted-foreground w-4">
                    {index + 1}
                  </span>
                  <p className="text-sm text-foreground group-hover:text-primary truncate">
                    {post.title}
                  </p>
                </div>
                <span className="flex items-center gap-1 text-sm text-primary ml-4">
                  <Bookmark className="h-3 w-3 fill-current" />
                  {post.bookmarks}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
