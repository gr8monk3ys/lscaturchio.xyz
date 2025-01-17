"use client";

import { motion, useInView } from "framer-motion";
import { ArrowUpRight, Calendar } from "lucide-react";
import Link from "next/link";
import { Badge } from "./badge";
import { useRef } from "react";

interface BlogPost {
  title: string;
  description: string;
  date: string;
  slug: string;
  tags: string[];
}

const recentPosts: BlogPost[] = [
  {
    title: "Understanding Ego",
    description: "Exploring the concept of ego and its impact on personal growth and relationships.",
    date: "January 16, 2024",
    slug: "understanding-ego",
    tags: ["Psychology", "Personal Growth"]
  },
  {
    title: "The Art of Data Science",
    description: "A deep dive into the intersection of creativity and analytical thinking in data science.",
    date: "January 10, 2024",
    slug: "art-of-data-science",
    tags: ["Data Science", "Technology"]
  },
  {
    title: "Music Production Workflow",
    description: "My personal approach to creating music and maintaining creative flow.",
    date: "January 5, 2024",
    slug: "music-production-workflow",
    tags: ["Music", "Creativity"]
  }
];

export function RecentBlogs() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

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
    hidden: { 
      opacity: 0,
      y: 20,
      scale: 0.95
    },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -45 },
    show: { 
      scale: 1, 
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    }
  };

  const tagVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: "spring",
        stiffness: 150,
        damping: 15
      }
    }
  };

  return (
    <section className="w-full px-4 md:px-6 py-12 lg:py-24">
      <div className="w-full max-w-7xl mx-auto" ref={containerRef}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          className="flex flex-col gap-10"
        >
          <motion.div variants={itemVariants} className="flex gap-4 flex-col items-start">
            <Badge variant="secondary">Latest Thoughts</Badge>
            <div className="flex gap-2 flex-col">
              <h2 className="text-3xl md:text-5xl tracking-tighter font-bold">
                Recent Blog Posts
              </h2>
              <p className="text-lg text-muted-foreground max-w-prose">
                Exploring ideas at the intersection of technology, creativity, and personal growth.
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPosts.map((post, index) => (
              <motion.div
                key={post.slug}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.02,
                  transition: { type: "spring", stiffness: 300 }
                }}
                className="group relative flex flex-col gap-4"
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="block bg-secondary/50 hover:bg-secondary/80 transition-colors rounded-xl p-6 group-hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <motion.div 
                        variants={itemVariants}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <Calendar className="h-4 w-4" />
                        <span>{post.date}</span>
                      </motion.div>
                      <motion.h3 
                        variants={itemVariants}
                        className="text-xl font-semibold tracking-tight group-hover:text-primary transition-colors"
                      >
                        {post.title}
                      </motion.h3>
                      <motion.p 
                        variants={itemVariants}
                        className="text-muted-foreground line-clamp-2"
                      >
                        {post.description}
                      </motion.p>
                    </div>
                    <motion.div 
                      variants={iconVariants}
                      className="shrink-0 size-8 flex items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors"
                    >
                      <ArrowUpRight className="size-4" />
                    </motion.div>
                  </div>
                  <motion.div 
                    variants={itemVariants}
                    className="flex flex-wrap gap-2 mt-4"
                  >
                    {post.tags.map((tag) => (
                      <motion.div
                        key={tag}
                        variants={tagVariants}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Badge variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      </motion.div>
                    ))}
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div
            variants={itemVariants}
            className="flex justify-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex"
            >
              <Link
                href="/blog"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                View All Posts
                <motion.div
                  variants={iconVariants}
                  className="inline-block"
                >
                  <ArrowUpRight className="size-4" />
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
