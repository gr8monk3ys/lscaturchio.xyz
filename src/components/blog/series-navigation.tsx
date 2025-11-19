"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface SeriesPost {
  slug: string;
  title: string;
  seriesOrder: number;
}

interface SeriesNavigationProps {
  seriesName: string;
  currentSlug: string;
  currentOrder: number;
}

/**
 * Series navigation component
 * Shows the current post's position in a series and provides navigation
 */
export function SeriesNavigation({
  seriesName,
  currentSlug,
  currentOrder,
}: SeriesNavigationProps) {
  const [seriesPosts, setSeriesPosts] = useState<SeriesPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSeriesPosts() {
      try {
        const response = await fetch(
          `/api/series?name=${encodeURIComponent(seriesName)}`
        );
        if (response.ok) {
          const data = await response.json();
          setSeriesPosts(data.posts);
        }
      } catch (error) {
        console.error("Failed to fetch series posts:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSeriesPosts();
  }, [seriesName]);

  if (isLoading) {
    return (
      <div className="my-8 animate-pulse rounded-xl bg-secondary/50 h-48" />
    );
  }

  if (seriesPosts.length === 0) {
    return null;
  }

  const currentIndex = seriesPosts.findIndex(
    (post) => post.slug === currentSlug
  );
  const prevPost = currentIndex > 0 ? seriesPosts[currentIndex - 1] : null;
  const nextPost =
    currentIndex < seriesPosts.length - 1
      ? seriesPosts[currentIndex + 1]
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-8"
    >
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5" />
            {seriesName} Series
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Part {currentOrder} of {seriesPosts.length}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* All Posts in Series */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              All posts in this series:
            </h4>
            <ol className="space-y-2">
              {seriesPosts.map((post) => (
                <li key={post.slug} className="flex items-start gap-2">
                  <span className="text-sm text-muted-foreground mt-0.5">
                    {post.seriesOrder}.
                  </span>
                  {post.slug === currentSlug ? (
                    <span className="text-sm font-medium text-primary">
                      {post.title} (current)
                    </span>
                  ) : (
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-sm hover:underline hover:text-primary transition-colors"
                    >
                      {post.title}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t">
            {prevPost ? (
              <Link href={`/blog/${prevPost.slug}`} className="flex-1">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <div className="text-left overflow-hidden">
                    <div className="text-xs text-muted-foreground">
                      Previous
                    </div>
                    <div className="text-sm truncate">{prevPost.title}</div>
                  </div>
                </Button>
              </Link>
            ) : (
              <div className="flex-1" />
            )}

            {nextPost ? (
              <Link href={`/blog/${nextPost.slug}`} className="flex-1">
                <Button variant="outline" className="w-full justify-end gap-2">
                  <div className="text-right overflow-hidden">
                    <div className="text-xs text-muted-foreground">Next</div>
                    <div className="text-sm truncate">{nextPost.title}</div>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <div className="flex-1" />
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
