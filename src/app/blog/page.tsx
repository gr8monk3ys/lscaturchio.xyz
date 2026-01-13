import React, { Suspense } from "react";
import { Container } from "@/components/Container";
import { getAllBlogs } from "../../../lib/getAllBlogs";
import { BlogGrid } from "@/components/blog/BlogGrid";
import { BlogStats } from "@/components/blog/blog-stats";
import Link from "next/link";
import { Tag } from "lucide-react";

interface Blog {
  slug: string;
  title: string;
  description: string;
  date: string;
  image: string;
  tags: string[];
}

export const metadata = {
  title: "Blog | Lorenzo Scaturchio",
  description:
    "Lorenzo Scaturchio is a developer, writer and speaker. He is a digital nomad and travels around the world while working remotely.",
};

export default async function Blog() {
  const blogs = await getAllBlogs();
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
          <Link
            href="/tags"
            className="flex items-center gap-2 px-4 py-2 rounded-xl neu-button hover:text-primary transition-all"
          >
            <Tag className="h-4 w-4" />
            <span className="text-sm font-medium">Browse by tag</span>
          </Link>
        </div>

        {/* Blog Statistics */}
        <BlogStats />

        <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
          <BlogGrid blogs={data} />
        </Suspense>
      </div>
    </Container>
  );
}
