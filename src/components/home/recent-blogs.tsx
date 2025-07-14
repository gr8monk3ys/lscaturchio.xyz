"use client";

import { motion, useInView } from "framer-motion";
import { ArrowUpRight, Calendar } from "lucide-react";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { useRef, useEffect } from "react";
// Import the hook for centralized blog metadata
import { useAllBlogs, BlogData } from "@/lib/useBlogData";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function RecentBlogs(): JSX.Element {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  
  // Use the centralized blog hook instead of direct API call
  const { blogs, isLoading } = useAllBlogs();
  
  // Get only the most recent 3 blogs
  const recentBlogs = blogs
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);


  if (isLoading) {
    return (
      <section ref={containerRef} className="py-16">
        <div className="container px-4 md:px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Recent Blogs</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-lg neu-card bg-stone-50 dark:bg-stone-800 h-[300px]"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={containerRef} className="py-16">
      <div className="container px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Recent Blogs</h2>
          <Link 
            href="/blog"
            className="group inline-flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 shadow-[1px_1px_2px_rgba(0,0,0,0.05),-1px_-1px_2px_rgba(255,255,255,0.6)] dark:shadow-[1px_1px_2px_rgba(0,0,0,0.2),-0.5px_-0.5px_1px_rgba(255,255,255,0.03)] hover:shadow-[0.5px_0.5px_1px_rgba(0,0,0,0.05),-0.5px_-0.5px_1px_rgba(255,255,255,0.7)] dark:hover:shadow-[0.5px_0.5px_1px_rgba(0,0,0,0.2),-0.25px_-0.25px_0.5px_rgba(255,255,255,0.04)] transition-all hover:translate-y-[-1px]"
          >
            View all blogs
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {recentBlogs.map((post) => (
            <motion.div
              key={post.slug}
              variants={itemVariants}
              className="group relative flex flex-col overflow-hidden rounded-lg neu-card bg-stone-50 dark:bg-stone-800 hover:shadow-[2px_2px_5px_rgba(0,0,0,0.08),-2px_-2px_5px_rgba(255,255,255,0.8)] dark:hover:shadow-[2px_2px_5px_rgba(0,0,0,0.3),-2px_-2px_5px_rgba(255,255,255,0.05)] transition-all"
            >
              <Link href={`/blog/${post.slug}`} className="flex flex-col flex-1 p-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Calendar className="size-4" />
                  <time dateTime={post.date}>{post.date}</time>
                </div>

                <h3 className="text-lg font-semibold tracking-tight mb-2">
                  {post.title}
                </h3>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {post.description}
                </p>

                <div className="mt-auto flex flex-wrap gap-1.5">
                  {post.tags?.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="px-2 py-0.5 text-xs font-medium bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 shadow-[1px_1px_2px_rgba(0,0,0,0.05),-1px_-1px_2px_rgba(255,255,255,0.6)] dark:shadow-[1px_1px_2px_rgba(0,0,0,0.2),-1px_-1px_2px_rgba(255,255,255,0.04)]"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm font-medium">
                  Read more
                  <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
