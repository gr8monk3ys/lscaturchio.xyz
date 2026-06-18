"use client";

import { Container } from "@/components/Container";
import { m } from '@/lib/motion';
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { FallbackImage } from "@/components/ui/fallback-image";

interface SeriesPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  image: string;
  seriesOrder: number;
}

export interface Series {
  name: string;
  posts: SeriesPost[];
  totalPosts: number;
  totalReadingTime: number;
}

export function SeriesPageClient({ allSeries }: { allSeries: Series[] }) {

  if (allSeries.length === 0) {
    return (
      <Container size="large">
        <div className="max-w-5xl mx-auto">
          {/* Header — gallery masthead */}
          <header className="mb-12">
            <span className="label-mono block">Garden · Series</span>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Blog Series
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              Multi-part deep dives into complex topics.
            </p>
            <hr className="gallery-rule mt-8" />
          </header>

          <div className="border border-dashed border-border p-12 text-center">
            <p className="text-lg text-muted-foreground">
              No blog series yet. Check back soon!
            </p>
            <Link
              href="/blog"
              className="mt-4 inline-block text-primary underline-offset-4 hover:underline"
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
      <div className="max-w-5xl mx-auto">
          {/* Header — gallery masthead */}
          <header className="mb-12">
            <span className="label-mono block">Garden · Series</span>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Blog Series
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              Multi-part deep dives into complex topics. Follow along as we
              explore ideas in depth.
            </p>
            <hr className="gallery-rule mt-8" />
          </header>

          {/* Series Grid */}
          <div className="space-y-16">
            {allSeries.map((series, index) => (
              <m.div
                key={series.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Series Header */}
                <div>
                  <h2 className="font-display text-2xl font-bold">{series.name}</h2>
                  <p className="label-mono mt-2">
                    {series.totalPosts}{" "}
                    {series.totalPosts === 1 ? "part" : "parts"}
                    {"  ·  "}
                    {series.totalReadingTime} min total
                  </p>
                </div>

                {/* Series Posts */}
                <div className="mt-6 divide-y divide-border border-y border-border">
                  {series.posts.map((post) => (
                    <Link
                      key={post.slug}
                      href={`/blog/${post.slug}`}
                      className="group flex items-start gap-4 py-6"
                    >
                      {/* Post Number */}
                      <div className="shrink-0">
                        <span className="font-display text-2xl font-semibold tabular-nums text-muted-foreground group-hover:text-primary transition-colors">
                          {String(post.seriesOrder).padStart(2, "0")}
                        </span>
                      </div>

                      {/* Post Image */}
                      <div className="relative shrink-0 w-24 h-24 overflow-hidden border border-border bg-muted">
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
                        <time dateTime={post.date} className="label-mono">
                          {new Date(post.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </time>
                      </div>

                      {/* Arrow Icon */}
                      <div className="shrink-0 self-center">
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-[transform,color]" />
                      </div>
                    </Link>
                  ))}
                </div>
              </m.div>
            ))}
          </div>
        </div>
    </Container>
  );
}
