import { Container } from "@/components/Container";
import { getAllBlogs } from "@/lib/getAllBlogs";
import { BlogGrid } from "@/components/blog/BlogGrid";
import { filterByStage } from "@/lib/blog-stage";
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
  title: "Blog",
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
  const stageFilter = getSearchParamValue(params, "stage");
  const requestedPage = getPageParamValue(getSearchParamValue(params, "page"));
  const blogs = await getAllBlogs();
  const normalizedTag = tagFilter.trim().toLowerCase();
  const tagFilteredBlogs = normalizedTag
    ? blogs.filter((blog) =>
        blog.tags.some((tag) => tag.toLowerCase() === normalizedTag)
      )
    : blogs;
  const filteredBlogs = filterByStage(tagFilteredBlogs, stageFilter);
  const totalPages = Math.max(1, Math.ceil(filteredBlogs.length / BLOGS_PER_PAGE));
  const currentPage = Math.min(requestedPage, totalPages);
  const pageStart = (currentPage - 1) * BLOGS_PER_PAGE;
  const visibleBlogs = filteredBlogs
    .slice(pageStart, pageStart + BLOGS_PER_PAGE)
    .map(toBlogPreview);

  return (
    <Container size="large">
      <div className="space-y-10">
        <header className="pt-4">
          <span className="label-mono block">Essays, Notes &amp; Experiments</span>
          <h1 className="mt-4 max-w-3xl text-[2.7rem] font-semibold leading-[1.02] tracking-tight text-foreground sm:text-[3rem] md:text-[3.15rem]">
            Essays on AI, software, and the world they&apos;re reshaping.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Half of this is practical notes on shipping RAG and production systems. The other half
            argues about politics, philosophy, and culture — because the systems we build land in a
            world, and pretending otherwise is its own ideology.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link
              href="/topics"
              prefetch={false}
              className="label-mono inline-flex items-center gap-2 text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <Tag className="h-3.5 w-3.5" />
              Browse by topic
            </Link>
            <Link
              href="/chat"
              prefetch={false}
              className="label-mono inline-flex items-center gap-2 text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Ask about a post
            </Link>
          </div>
          <hr className="gallery-rule mt-8" />
        </header>

        <BlogGrid
          blogs={visibleBlogs}
          currentPage={currentPage}
          pageStart={pageStart}
          tagFilter={tagFilter}
          stageFilter={stageFilter}
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
