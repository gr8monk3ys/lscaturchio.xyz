import { BlogCard } from "@/components/blog/BlogCard";
import { X } from "lucide-react";
import Link from "next/link";
import { getBlogArchiveHref } from "@/lib/blog-archive-href";

interface Blog {
  slug: string;
  title: string;
  description: string;
  date: string;
  image: string;
  tags: string[];
}

interface BlogGridProps {
  blogs: Blog[];
  tagFilter?: string;
  stageFilter?: string;
  totalBlogs: number;
  currentPage: number;
  pageStart: number;
  totalPages: number;
}


export function BlogGrid({
  blogs,
  tagFilter = "",
  stageFilter = "",
  totalBlogs,
  currentPage,
  pageStart,
  totalPages,
}: BlogGridProps) {
  const normalizedTag = tagFilter.trim().toLowerCase();
  const firstVisiblePost = totalBlogs === 0 ? 0 : pageStart + 1;
  const lastVisiblePost = totalBlogs === 0 ? 0 : pageStart + blogs.length;

  return (
    <>
      {/* The stage filter lives in the page header, once.
          This component rendered a second one — `Stage · All · SEEDLING · …`
          — 97px below it, selecting with ink-versus-muted where the header row
          uses forest ink and an underline, and without the counts. Two
          controls for one concept that disagree about their own state are
          worse than either alone. The header row absorbed the "All" this one
          had, and its links now preserve an active tag. */}

      {normalizedTag && (
        <div className="mb-8 flex flex-col items-start justify-between gap-3 border-b border-border pb-4 sm:flex-row sm:items-center">
          <span className="label-mono">
            Filtered — {normalizedTag} · {totalBlogs} {totalBlogs === 1 ? "post" : "posts"}
          </span>
          <Link
            href={getBlogArchiveHref(1, "", stageFilter)}
            prefetch={false}
            className="label-mono label-link inline-flex items-center gap-1.5 text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            <X className="h-3.5 w-3.5" />
            Clear filter
          </Link>
        </div>
      )}

      {totalBlogs === 0 && (
        <div className="border-y border-border py-20 text-center">
          <p className="text-lg text-muted-foreground">
            No blog posts found with the tag &quot;{normalizedTag}&quot;.
          </p>
          <Link
            href="/blog"
            prefetch={false}
            className="label-mono label-link mt-4 inline-block text-primary underline-offset-4 hover:underline"
          >
            View all posts →
          </Link>
        </div>
      )}

      <div
        className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"
        style={{ contentVisibility: "auto", containIntrinsicSize: "1px 1600px" }}
      >
        {blogs.map((blog, index) => (
          <BlogCard
            key={blog.slug}
            {...blog}
            priority={currentPage === 1 && index === 0}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <nav
          aria-label="Blog archive pagination"
          className="mt-12 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <span className="label-mono">
            Showing {firstVisiblePost}–{lastVisiblePost} of {totalBlogs}
          </span>

          <div className="flex items-center gap-6">
            {currentPage > 1 ? (
              <Link
                href={getBlogArchiveHref(currentPage - 1, normalizedTag, stageFilter)}
                prefetch={false}
                className="label-mono label-link text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
              >
                ← Prev
              </Link>
            ) : (
              <span className="label-mono text-muted-foreground/60" aria-disabled="true">← Prev</span>
            )}

            <span className="label-mono">
              {currentPage} / {totalPages}
            </span>

            {currentPage < totalPages ? (
              <Link
                href={getBlogArchiveHref(currentPage + 1, normalizedTag, stageFilter)}
                prefetch={false}
                className="label-mono label-link text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
              >
                Next →
              </Link>
            ) : (
              <span className="label-mono text-muted-foreground/60" aria-disabled="true">Next →</span>
            )}
          </div>
        </nav>
      )}
    </>
  );
}
