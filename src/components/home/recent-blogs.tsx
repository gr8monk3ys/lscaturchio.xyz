"use client";

import { motion, useInView } from "framer-motion";
import { ArrowUpRight, Calendar } from "lucide-react";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { useRef, useEffect, useState } from "react";

interface BlogPost {
  title: string;
  description: string;
  date: string;
  slug: string;
  tags: string[];
  image?: string;
}

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

export function RecentBlogs() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const response = await fetch('/api/blogs');
        if (!response.ok) throw new Error('Failed to fetch blogs');
        const data = await response.json();
        setBlogs(data);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBlogs();
  }, []);

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
                className="animate-pulse rounded-xl bg-secondary/50 h-[300px]"
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
            className="group inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
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
          {blogs.map((post) => (
            <motion.div
              key={post.slug}
              variants={itemVariants}
              className="group relative flex flex-col overflow-hidden rounded-xl bg-secondary/50 transition-all hover:bg-secondary/70"
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
                      className="px-2 py-0.5 text-xs font-medium"
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
