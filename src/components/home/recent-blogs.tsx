"use client";

import { motion, useInView } from "framer-motion";
import { ArrowUpRight, Calendar } from "lucide-react";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { Section, SectionHeader } from "../ui/Section";
import { useRef, useEffect, useState } from "react";
import { logError } from "@/lib/logger";
import { BlogViewCount } from "../blog/blog-view-count";
import { showContainerVariants, showItemVariants } from "@/lib/animations";

interface BlogPost {
  title: string;
  description: string;
  date: string;
  slug: string;
  tags: string[];
  image?: string;
}

export function RecentBlogs() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const response = await fetch('/api/v1/blogs?limit=3');
        if (!response.ok) throw new Error('Failed to fetch blogs');
        const result = await response.json();
        setBlogs(result.data || []);
      } catch (error) {
        logError('Failed to fetch recent blogs', error, { component: 'RecentBlogs', action: 'fetchBlogs' });
      } finally {
        setIsLoading(false);
      }
    }

    fetchBlogs();
  }, []);

  if (isLoading) {
    return (
      <Section padding="default" size="wide" divider>
        <div ref={containerRef} aria-busy="true" aria-label="Loading recent blog posts">
          <SectionHeader title="Recent Blogs" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl bg-secondary/50 h-[280px]"
                role="presentation"
              />
            ))}
          </div>
        </div>
      </Section>
    );
  }

  return (
    <Section padding="default" size="wide" divider>
      <div ref={containerRef}>
        <SectionHeader
          title="Recent Blogs"
          action={
            <Link
              href="/blog"
              className="group inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              View all blogs
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          }
        />

        <motion.div
          variants={showContainerVariants}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {blogs.map((post) => (
            <motion.div
              key={post.slug}
              variants={showItemVariants}
              className="group relative flex flex-col overflow-hidden rounded-xl bg-secondary/50 transition-all hover:bg-secondary/70"
            >
              <Link href={`/blog/${post.slug}`} className="flex flex-col flex-1 p-6">
                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4" />
                    <time dateTime={post.date}>{post.date}</time>
                  </div>
                  <BlogViewCount slug={post.slug} />
                </div>

                <h3 className="text-lg font-semibold tracking-tight mb-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {post.description}
                </p>

                <div className="mt-auto flex flex-wrap gap-1.5">
                  {post.tags?.slice(0, 3).map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="px-2 py-0.5 text-xs font-medium"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm font-medium text-primary">
                  Read more
                  <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Section>
  );
}
