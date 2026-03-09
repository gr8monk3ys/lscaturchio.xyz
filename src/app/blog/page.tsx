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

type SearchParamValue = string | string[] | undefined;

function getSearchParamValue(
  params: Record<string, SearchParamValue>,
  key: string
): string {
  const value = params[key];
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
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

export default async function Blog({
  searchParams,
}: {
  searchParams?: Promise<Record<string, SearchParamValue>>;
}) {
  const params = (await searchParams) ?? {};
  const tagFilter = getSearchParamValue(params, "tag");
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
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-foreground">
              Blog
            </h1>
            <p className="text-muted-foreground">
              Thoughts on software development, technology, and life.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/tags"
              className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <Tag className="h-4 w-4" />
              Browse by Tag
            </Link>
            <span className="text-sm text-muted-foreground">or</span>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <MessageSquare className="h-4 w-4" />
              Ask About a Post
            </Link>
          </div>
        </div>

        <BlogStats
          stats={{
            totalPosts,
            totalReadingTime,
            avgReadingTime,
            topTags,
          }}
        />

        <BlogGrid blogs={data} tagFilter={tagFilter} />
      </div>
    </Container>
  );
}
