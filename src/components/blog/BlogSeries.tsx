// Rule: TypeScript Usage - Use TypeScript for all code
"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface SeriesPost {
  title: string;
  slug: string;
  description?: string;
  part: number;
  isCurrent?: boolean;
}

interface BlogSeriesProps {
  title: string;
  description?: string;
  posts: SeriesPost[];
  className?: string;
}

export function BlogSeries({
  title,
  description,
  posts,
  className,
}: BlogSeriesProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Sort posts by part number
  const sortedPosts = [...posts].sort((a, b) => a.part - b.part);
  
  // Find the current post and the next post in the series
  const currentPostIndex = sortedPosts.findIndex(post => post.isCurrent);
  const nextPost = currentPostIndex >= 0 && currentPostIndex < sortedPosts.length - 1 
    ? sortedPosts[currentPostIndex + 1] 
    : null;

  return (
    <div className={cn(
      "rounded-lg border border-stone-200 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-900",
      className
    )}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-medium text-stone-900 dark:text-stone-100">
          {title}
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="rounded-full p-1.5 text-stone-500 hover:bg-stone-200 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
          aria-label={isExpanded ? "Collapse series list" : "Expand series list"}
        >
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {description && (
        <p className="mb-4 text-sm text-stone-600 dark:text-stone-400">
          {description}
        </p>
      )}

      <div className="mb-2 font-medium text-stone-600 dark:text-stone-400">
        {posts.length} part{posts.length !== 1 ? "s" : ""} in this series
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <ul className="mb-4 space-y-3 pt-2">
              {sortedPosts.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className={cn(
                      "flex items-start rounded-md p-2 text-sm hover:bg-stone-100 dark:hover:bg-stone-800",
                      post.isCurrent && "bg-stone-100 dark:bg-stone-800"
                    )}
                  >
                    <span
                      className={cn(
                        "mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium",
                        post.isCurrent
                          ? "bg-primary text-white"
                          : "bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-300"
                      )}
                    >
                      {post.part}
                    </span>
                    <div className="flex-1">
                      <div
                        className={cn(
                          "font-medium",
                          post.isCurrent
                            ? "text-primary"
                            : "text-stone-700 dark:text-stone-300"
                        )}
                      >
                        {post.title}
                        {post.isCurrent && (
                          <span className="ml-2 inline-block rounded-full bg-stone-200 px-2 py-0.5 text-xs dark:bg-stone-700">
                            Current
                          </span>
                        )}
                      </div>
                      {post.description && (
                        <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                          {post.description}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {!isExpanded && nextPost && (
        <div className="mt-4 border-t border-stone-200 pt-4 dark:border-stone-700">
          <div className="text-sm text-stone-500 dark:text-stone-400">
            Next in series
          </div>
          <Link
            href={`/blog/${nextPost.slug}`}
            className="mt-2 flex items-center justify-between rounded-md p-2 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <div>
              <div className="font-medium text-stone-800 dark:text-stone-200">
                Part {nextPost.part}: {nextPost.title}
              </div>
              {nextPost.description && (
                <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
                  {nextPost.description}
                </p>
              )}
            </div>
            <ArrowRight className="ml-2 h-4 w-4 flex-shrink-0 text-stone-400" />
          </Link>
        </div>
      )}
    </div>
  );
}
