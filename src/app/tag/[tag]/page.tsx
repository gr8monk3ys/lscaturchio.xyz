import type { Metadata } from "next";
import Link from "next/link";
import { Tag } from "lucide-react";

import { Container } from "@/components/Container";
import { BlogCard } from "@/components/blog/BlogCard";
import { getAllBlogs } from "@/lib/getAllBlogs";
import { ogCardUrl } from "@/lib/seo";

type Props = {
  params: Promise<{ tag: string }>;
};

function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const raw = (await params).tag;
  const tag = safeDecodeURIComponent(raw);

  const title = `Tag: ${tag} | Lorenzo Scaturchio`;
  const description = `Blog posts tagged with \"${tag}\".`;
  const image = ogCardUrl({ title: `Tag: ${tag}`, description: "Browse related posts", type: "blog" });

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export const revalidate = 3600;

export default async function TagPage({ params }: Props) {
  const raw = (await params).tag;
  const tag = safeDecodeURIComponent(raw);

  const blogs = await getAllBlogs();
  const filtered = blogs.filter((blog) =>
    blog.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
  );

  return (
    <Container className="mt-16 lg:mt-32" size="large">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Tag className="h-4 w-4 text-primary" />
              <span>Tag</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-foreground">
              {tag}
            </h1>
            <p className="text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "post" : "posts"} tagged with "{tag}".
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/tags"
              className="flex items-center gap-2 px-4 py-2 rounded-xl neu-button hover:text-primary transition-all"
            >
              Browse all tags
            </Link>
            <Link
              href="/blog"
              className="flex items-center gap-2 rounded-xl px-4 py-2 cta-secondary hover:text-primary transition-all"
            >
              View all posts
            </Link>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 neu-card rounded-2xl">
            <p className="text-lg text-muted-foreground">
              No blog posts found with the tag "{tag}".
            </p>
            <Link href="/tags" className="mt-4 inline-block px-6 py-2 rounded-xl cta-secondary">
              Browse tags
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((blog) => (
              <BlogCard
                key={blog.slug}
                slug={blog.slug}
                title={blog.title}
                description={blog.description}
                date={blog.date}
                image={blog.image}
                tags={blog.tags}
              />
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}

