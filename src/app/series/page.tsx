"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/Container";
import { motion } from "framer-motion";
import { BookOpen, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import { FallbackImage } from "@/components/ui/fallback-image";
import { Badge } from "@/components/ui/badge";
import { logError } from "@/lib/logger";

interface SeriesPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  image: string;
  seriesOrder: number;
}

interface Series {
  name: string;
  posts: SeriesPost[];
  totalPosts: number;
  totalReadingTime: number;
}

export default function SeriesPage() {
  const [allSeries, setAllSeries] = useState<Series[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSeries() {
      try {
        const response = await fetch("/api/all-series");
        if (response.ok) {
          const data = await response.json();
          setAllSeries(data.series);
        }
      } catch (error) {
        logError("Failed to fetch series", error, { page: "SeriesPage" });
      } finally {
        setIsLoading(false);
      }
    }

    fetchSeries();
  }, []);

  if (isLoading) {
    return (
      <Container size="large">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-stone-600 dark:text-stone-300">
              Blog Series
            </h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Multi-part deep dives into complex topics.
            </p>
          </div>

          <div className="grid gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl bg-secondary/50 h-64"
              />
            ))}
          </div>
        </div>
      </Container>
    );
  }

  if (allSeries.length === 0) {
    return (
      <Container size="large">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-stone-600 dark:text-stone-300">
              Blog Series
            </h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Multi-part deep dives into complex topics.
            </p>
          </div>

          <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg text-muted-foreground">
              No blog series yet. Check back soon!
            </p>
            <Link
              href="/blog"
              className="mt-4 inline-block text-primary hover:underline"
            >
              Browse all posts
            </Link>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container size="large">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-stone-600 dark:text-stone-300">
            Blog Series
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Multi-part deep dives into complex topics. Follow along as we
            explore ideas in depth.
          </p>
        </div>

        {/* Series Grid */}
        <div className="grid gap-8">
          {allSeries.map((series, index) => (
            <motion.div
              key={series.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Series Header */}
              <div className="p-6 border-b bg-secondary/30">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <h2 className="text-2xl font-bold">{series.name}</h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary">
                          {series.totalPosts}{" "}
                          {series.totalPosts === 1 ? "part" : "parts"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{series.totalReadingTime} min total</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Series Posts */}
              <div className="divide-y">
                {series.posts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="group flex items-start gap-4 p-6 hover:bg-secondary/20 transition-colors"
                  >
                    {/* Post Number Badge */}
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        {post.seriesOrder}
                      </div>
                    </div>

                    {/* Post Image */}
                    <div className="relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-muted">
                      <FallbackImage
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Post Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors line-clamp-1">
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {post.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <time dateTime={post.date}>
                          {new Date(post.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </time>
                      </div>
                    </div>

                    {/* Arrow Icon */}
                    <div className="flex-shrink-0 self-center">
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Container>
  );
}
