import React, { Suspense } from "react";
import { Container } from "@/components/Container";
import { getAllBlogs } from "@/lib/getAllBlogs";
import { BlogGrid } from "@/components/blog/BlogGrid";
import { BlogStats } from "@/components/blog/blog-stats";
import Link from "next/link";
import { MessageSquare, Tag } from "lucide-react";
import type { Metadata } from "next";
import { ogCardUrl } from "@/lib/seo";

interface Blog {
  slug: string;
  title: string;
  description: string;
  date: string;
  image: string;
  tags: string[];
}

export const metadata: Metadata = {
  title: "Blog | Lorenzo Scaturchio",
  description:
    "Lorenzo Scaturchio is a developer, writer and speaker. He is a digital nomad and travels around the world while working remotely.",
  openGraph: {
    title: "Blog | Lorenzo Scaturchio",
    description:
      "Essays on software development, AI, and the politics of technology.",
    images: [
      {
        url: ogCardUrl({
          title: "Blog",
          description: "Essays on software, AI, and technology",
          type: "blog",
        }),
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Lorenzo Scaturchio",
    description: "Essays on software, AI, and technology.",
    images: [ogCardUrl({ title: "Blog", description: "Essays on software, AI, and technology", type: "blog" })],
  },
};

// Revalidate the blog listing every hour for fresh content
export const revalidate = 3600;

export default async function Blog() {
  const blogs = await getAllBlogs();
  const totalPosts = blogs.length;
  const totalReadingTime = blogs.reduce((total, blog) => {
    const estimatedMinutes = Math.ceil(blog.content.length / 1000) * 5;
    return total + estimatedMinutes;
  }, 0);
  const avgReadingTime = totalPosts > 0 ? Math.round(totalReadingTime / totalPosts) : 0;

  const tagCounts = new Map<string, number>();
  blogs.forEach((blog) => {
    blog.tags.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });

  const topTags = Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const data = blogs.map((blog) => ({
    slug: blog.slug,
    title: blog.title,
    description: blog.description,
    date: blog.date,
    image: blog.image,
    tags: blog.tags,
  }));

  return (
    <Container size="large">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-foreground">
              Blog
            </h1>
            <p className="text-muted-foreground">
              Thoughts on software development, technology, and life.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/chat"
              className="flex items-center gap-2 rounded-xl px-4 py-2 cta-secondary hover:text-primary transition-all"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm font-medium">Chat about posts</span>
            </Link>
            <Link
              href="/tags"
              className="flex items-center gap-2 px-4 py-2 rounded-xl neu-button hover:text-primary transition-all"
            >
              <Tag className="h-4 w-4" />
              <span className="text-sm font-medium">Browse by tag</span>
            </Link>
          </div>
        </div>

        {/* Blog Statistics */}
        <BlogStats
          stats={{
            totalPosts,
            totalReadingTime,
            avgReadingTime,
            topTags,
          }}
        />

        <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
          <BlogGrid blogs={data} />
        </Suspense>
      </div>
    </Container>
  );
}
