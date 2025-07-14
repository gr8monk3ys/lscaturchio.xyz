// Rule: TypeScript Usage - Use TypeScript for all code
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatDate } from "../../../lib/formatDate";
import { calculateReadingTime } from "@/lib/readingTime";
import { FallbackImage } from "@/components/ui/fallback-image";
import { RelatedPost } from "@/lib/getRelatedPosts";
import { Calendar, Clock } from "lucide-react";

interface RelatedPostsProps {
  posts: RelatedPost[];
  currentSlug: string;
}

export function RelatedPosts({ posts, currentSlug }: RelatedPostsProps): JSX.Element {
  if (!posts || posts.length === 0) {
    return <></>;
  }

  return (
    <div className="mt-16 border-t border-stone-200 pt-10 dark:border-stone-700">
      <h2 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
        Related Articles
      </h2>
      <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, index) => (
          <RelatedPostCard 
            key={post.slug} 
            post={post} 
            index={index} 
          />
        ))}
      </div>
    </div>
  );
}

interface RelatedPostCardProps {
  post: RelatedPost;
  index: number;
}

function RelatedPostCard({ post, index }: RelatedPostCardProps): JSX.Element {
  const [readingTime, setReadingTime] = useState({ text: "" });

  useEffect(() => {
    // Estimate reading time based on description length (as a fallback)
    const textContent = post.description || "";
    const calculatedReadingTime = calculateReadingTime(textContent);
    setReadingTime(calculatedReadingTime);
  }, [post.description]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 * index }}
      className="group relative flex flex-col overflow-hidden rounded-lg bg-stone-50 dark:bg-stone-800 shadow-[2px_2px_5px_rgba(0,0,0,0.05),-2px_-2px_5px_rgba(255,255,255,0.7)] dark:shadow-[2px_2px_5px_rgba(0,0,0,0.2),-1px_-1px_3px_rgba(255,255,255,0.05)] hover:shadow-[1px_1px_3px_rgba(0,0,0,0.05),-1px_-1px_3px_rgba(255,255,255,0.8)] dark:hover:shadow-[1px_1px_3px_rgba(0,0,0,0.3),-0.5px_-0.5px_2px_rgba(255,255,255,0.08)] hover:translate-y-[-2px] transition-all border-0"
    >
      <div className="aspect-video relative bg-stone-100 dark:bg-stone-700">
        <FallbackImage
          src={post.image || "/images/blog/placeholder.webp"}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col justify-between p-4">
        <div className="flex-1">
          <div className="flex items-center gap-4 text-xs mb-2">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <time dateTime={post.date} className="text-stone-500 dark:text-stone-400">
                {formatDate(post.date)}
              </time>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span className="text-stone-500 dark:text-stone-400">{readingTime.text}</span>
            </div>
          </div>
          <Link href={`/blog/${post.slug}`} className="block">
            <h3 className="text-lg font-semibold leading-6 text-stone-900 dark:text-stone-100 group-hover:text-primary">
              {post.title}
            </h3>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-stone-600 dark:text-stone-300">
              {post.description}
            </p>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
