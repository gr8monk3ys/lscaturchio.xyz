"use client";

import { ArrowUpRight, Calendar } from "lucide-react";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { Section, SectionHeader } from "../ui/Section";
import { BlogViewCount } from "../blog/blog-view-count";
import Image from "next/image";
import { formatDate } from "@/lib/formatDate";
import { Reveal } from "@/components/motion/reveal";

interface BlogPost {
  title: string;
  description: string;
  date: string;
  slug: string;
  tags: string[];
  image?: string;
}

interface RecentBlogsProps {
  blogs: BlogPost[];
}

export function RecentBlogs({ blogs }: RecentBlogsProps) {
  return (
    <Section padding="default" size="wide" divider topDivider>
      <div>
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

        <div className="grid grid-cols-1 gap-6 md:grid-cols-6">
          {blogs.map((post, index) => (
            <Reveal
              key={post.slug}
              delayMs={index * 80}
              className={`${index === 0 ? "md:col-span-4" : "md:col-span-2"}`}
            >
              <div
                className="group relative overflow-hidden rounded-2xl border border-border/60 bg-background/95 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
              >
                <Link href={`/blog/${post.slug}`} className="flex h-full flex-col">
                  <div className="relative h-44 overflow-hidden md:h-52">
                    <Image
                      src={post.image || "/images/blog/default.webp"}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 66vw, 40vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white/90">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="size-3.5" />
                        <time dateTime={post.date}>{formatDate(post.date)}</time>
                      </div>
                      <BlogViewCount slug={post.slug} />
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="mb-2 text-lg font-semibold tracking-tight transition-colors group-hover:text-primary">
                      {post.title}
                    </h3>

                    <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                      {post.description}
                    </p>

                    <div className="mt-auto flex flex-wrap gap-1.5">
                      {post.tags?.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="border border-border/50 bg-muted/70 px-2 py-0.5 text-xs font-medium"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-sm font-medium text-primary">
                      Read more
                      <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
