import { Container } from "@/components/Container";
import { getAllBlogs } from "@/lib/getAllBlogs";
import { BlogGrid } from "@/components/blog/BlogGrid";
import { BlogArchiveStats } from "@/components/blog/blog-archive-stats";
import Link from "next/link";
import { MessageSquare, Tag } from "lucide-react";
import type { Metadata } from "next";
import { ogCardUrl } from "@/lib/seo";
import { toBlogPreview } from "@/lib/blog-data";
import { Suspense } from "react";

interface Blog {
  slug: string;
  title: string;
  description: string;
  date: string;
  image: string;
  tags: string[];
}

type SearchParamValue = string | string[] | undefined;
const BLOGS_PER_PAGE = 12;

function getSearchParamValue(
  params: Record<string, SearchParamValue>,
  key: string
): string {
  const value = params[key];
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function getPageParamValue(value: string): number {
  const page = Number.parseInt(value, 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
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
  const requestedPage = getPageParamValue(getSearchParamValue(params, "page"));
  const blogs = await getAllBlogs();
  const normalizedTag = tagFilter.trim().toLowerCase();
  const filteredBlogs = normalizedTag
    ? blogs.filter((blog) =>
        blog.tags.some((tag) => tag.toLowerCase() === normalizedTag)
      )
    : blogs;
  const totalPages = Math.max(1, Math.ceil(filteredBlogs.length / BLOGS_PER_PAGE));
  const currentPage = Math.min(requestedPage, totalPages);
  const pageStart = (currentPage - 1) * BLOGS_PER_PAGE;
  const visibleBlogs = filteredBlogs
    .slice(pageStart, pageStart + BLOGS_PER_PAGE)
    .map(toBlogPreview);

  return (
    <Container size="large">
      <div className="space-y-6">
        <section className="rounded-3xl border border-border/60 bg-background/80 px-6 py-7 sm:px-8 md:px-10 md:py-8">
          <div className="max-w-176 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Essays, Notes, and Experiments
            </p>
            <h1 className="font-system text-[2.7rem] font-semibold leading-[1.02] tracking-tight text-foreground sm:text-[3rem] md:text-[3.15rem]">
              Writing about AI, software, and the ways real systems fail.
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
              Practical notes on shipping RAG, working with product constraints, and building software
              that stays legible after the prototype phase.
            </p>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              href="/tags"
              prefetch={false}
              className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <Tag className="h-4 w-4" />
              Browse by Tag
            </Link>
            <span className="text-sm text-muted-foreground">or</span>
            <Link
              href="/chat"
              prefetch={false}
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <MessageSquare className="h-4 w-4" />
              Ask About a Post
            </Link>
          </div>
        </section>

        <BlogGrid
          blogs={visibleBlogs}
          currentPage={currentPage}
          pageStart={pageStart}
          tagFilter={tagFilter}
          totalBlogs={filteredBlogs.length}
          totalPages={totalPages}
        />

        <Suspense fallback={<div className="min-h-[260px]" />}>
          <BlogArchiveStats />
        </Suspense>
      </div>
    </Container>
  );
}
