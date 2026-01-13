"use client";

import { useEffect, useState, useRef } from "react";
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
  // Prevent double-click race conditions
  const isLikePending = useRef(false);
  const isBookmarkPending = useRef(false);

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
      } catch {
        // Silently fail - will show 0 counts
      } finally {
        setIsLoading(false);
      }
    };

    fetchReactions();
  }, [slug]);

  const handleLike = async () => {
    // Prevent double-click race conditions
    if (isLikePending.current) return;
    isLikePending.current = true;

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
    } catch {
      // Silently fail - user can retry
    } finally {
      isLikePending.current = false;
    }
  };

  const handleBookmark = async () => {
    // Prevent double-click race conditions
    if (isBookmarkPending.current) return;
    isBookmarkPending.current = true;

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
    } catch {
      // Silently fail - user can retry
    } finally {
      isBookmarkPending.current = false;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-4" aria-busy="true" aria-label="Loading reactions">
        <div className="h-12 w-28 animate-pulse rounded-xl neu-flat" role="presentation" />
        <div className="h-12 w-32 animate-pulse rounded-xl neu-flat" role="presentation" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {/* Like Button */}
      <motion.button
        onClick={handleLike}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all ${
          hasLiked
            ? "neu-pressed text-red-600 dark:text-red-400"
            : "neu-button hover:text-red-500"
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
        className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all ${
          hasBookmarked
            ? "neu-pressed text-primary"
            : "neu-button hover:text-primary"
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
