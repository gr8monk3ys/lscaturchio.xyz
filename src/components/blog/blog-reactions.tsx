"use client";

import { useEffect, useState } from "react";
import { Heart, Bookmark } from "lucide-react";
import { motion } from "framer-motion";

interface BlogReactionsProps {
  slug: string;
}

interface Reactions {
  likes: number;
  bookmarks: number;
}

export function BlogReactions({ slug }: BlogReactionsProps) {
  const [reactions, setReactions] = useState<Reactions>({ likes: 0, bookmarks: 0 });
  const [hasLiked, setHasLiked] = useState(false);
  const [hasBookmarked, setHasBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for user's reactions
    const likedKey = `liked_${slug}`;
    const bookmarkedKey = `bookmarked_${slug}`;

    setHasLiked(localStorage.getItem(likedKey) === "true");
    setHasBookmarked(localStorage.getItem(bookmarkedKey) === "true");

    // Fetch current reaction counts
    const fetchReactions = async () => {
      try {
        const response = await fetch(`/api/reactions?slug=${encodeURIComponent(slug)}`);
        if (response.ok) {
          const data = await response.json();
          setReactions({ likes: data.likes, bookmarks: data.bookmarks });
        }
      } catch (error) {
        console.error("Failed to fetch reactions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReactions();
  }, [slug]);

  const handleLike = async () => {
    const likedKey = `liked_${slug}`;
    const newLikedState = !hasLiked;

    try {
      if (newLikedState) {
        // Add like
        const response = await fetch("/api/reactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, type: "like" }),
        });

        if (response.ok) {
          const data = await response.json();
          setReactions({ likes: data.likes, bookmarks: data.bookmarks });
          setHasLiked(true);
          localStorage.setItem(likedKey, "true");
        }
      } else {
        // Remove like
        const response = await fetch(
          `/api/reactions?slug=${encodeURIComponent(slug)}&type=like`,
          { method: "DELETE" }
        );

        if (response.ok) {
          const data = await response.json();
          setReactions({ likes: data.likes, bookmarks: data.bookmarks });
          setHasLiked(false);
          localStorage.removeItem(likedKey);
        }
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  const handleBookmark = async () => {
    const bookmarkedKey = `bookmarked_${slug}`;
    const newBookmarkedState = !hasBookmarked;

    try {
      if (newBookmarkedState) {
        // Add bookmark
        const response = await fetch("/api/reactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, type: "bookmark" }),
        });

        if (response.ok) {
          const data = await response.json();
          setReactions({ likes: data.likes, bookmarks: data.bookmarks });
          setHasBookmarked(true);
          localStorage.setItem(bookmarkedKey, "true");
        }
      } else {
        // Remove bookmark
        const response = await fetch(
          `/api/reactions?slug=${encodeURIComponent(slug)}&type=bookmark`,
          { method: "DELETE" }
        );

        if (response.ok) {
          const data = await response.json();
          setReactions({ likes: data.likes, bookmarks: data.bookmarks });
          setHasBookmarked(false);
          localStorage.removeItem(bookmarkedKey);
        }
      }
    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-10 w-24 animate-pulse rounded-full bg-muted" />
        <div className="h-10 w-28 animate-pulse rounded-full bg-muted" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Like Button */}
      <motion.button
        onClick={handleLike}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
          hasLiked
            ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"
            : "border-gray-200 dark:border-gray-800 hover:border-red-200 dark:hover:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/20"
        }`}
        aria-label={hasLiked ? "Unlike post" : "Like post"}
      >
        <motion.div
          animate={hasLiked ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <Heart
            className={`h-5 w-5 ${hasLiked ? "fill-current" : ""}`}
          />
        </motion.div>
        <span className="text-sm font-medium">
          {reactions.likes > 0 && reactions.likes.toLocaleString()}
        </span>
      </motion.button>

      {/* Bookmark Button */}
      <motion.button
        onClick={handleBookmark}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
          hasBookmarked
            ? "bg-primary/10 border-primary/20 text-primary"
            : "border-gray-200 dark:border-gray-800 hover:border-primary/20 hover:bg-primary/10"
        }`}
        aria-label={hasBookmarked ? "Remove bookmark" : "Bookmark post"}
      >
        <motion.div
          animate={hasBookmarked ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <Bookmark
            className={`h-5 w-5 ${hasBookmarked ? "fill-current" : ""}`}
          />
        </motion.div>
        <span className="text-sm font-medium">
          {reactions.bookmarks > 0 && reactions.bookmarks.toLocaleString()}
        </span>
      </motion.button>
    </div>
  );
}
