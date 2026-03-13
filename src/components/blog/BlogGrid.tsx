import { BlogCard } from "@/components/blog/BlogCard";
import { X } from "lucide-react";
import Link from "next/link";

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
  totalBlogs: number;
  currentPage: number;
  pageStart: number;
  totalPages: number;
}

function getBlogArchiveHref(page: number, tagFilter: string): string {
  const params = new URLSearchParams();

  if (tagFilter) {
    params.set("tag", tagFilter);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();
  return query ? `/blog?${query}` : "/blog";
}

export function BlogGrid({
  blogs,
  tagFilter = "",
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
      {normalizedTag && (
        <div className="mb-6 p-5 rounded-2xl neu-flat flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium">Filtered by tag:</span>
            <span className="px-4 py-1.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium capitalize shadow-xs">
              {normalizedTag}
            </span>
            <span className="text-sm text-muted-foreground">
              ({totalBlogs} {totalBlogs === 1 ? "post" : "posts"})
            </span>
          </div>
          <Link
            href="/blog"
            prefetch={false}
            className="flex items-center gap-2 px-4 py-2 rounded-xl neu-button text-sm text-muted-foreground hover:text-foreground transition-all"
          >
            <X className="h-4 w-4" />
            Clear filter
          </Link>
        </div>
      )}

      {totalBlogs === 0 && (
        <div className="text-center py-16 neu-card rounded-2xl">
          <p className="text-lg text-muted-foreground">
            No blog posts found with the tag &quot;{normalizedTag}&quot;.
          </p>
          <Link
            href="/blog"
            prefetch={false}
            className="mt-4 inline-block px-6 py-2 rounded-xl cta-secondary"
          >
            View all posts
          </Link>
        </div>
      )}

      <div
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
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
          className="mt-8 flex flex-col gap-4 rounded-2xl border border-border/70 bg-muted/20 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-sm text-muted-foreground">
            Showing {firstVisiblePost}-{lastVisiblePost} of {totalBlogs} posts
          </p>

          <div className="flex items-center gap-3">
            {currentPage > 1 ? (
              <Link
                href={getBlogArchiveHref(currentPage - 1, normalizedTag)}
                prefetch={false}
                className="inline-flex items-center rounded-full border border-border/70 bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                Previous
              </Link>
            ) : (
              <span className="inline-flex items-center rounded-full border border-border/50 bg-background/60 px-4 py-2 text-sm text-muted-foreground">
                Previous
              </span>
            )}

            <span className="text-sm font-medium text-foreground">
              Page {currentPage} of {totalPages}
            </span>

            {currentPage < totalPages ? (
              <Link
                href={getBlogArchiveHref(currentPage + 1, normalizedTag)}
                prefetch={false}
                className="inline-flex items-center rounded-full border border-border/70 bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                Next
              </Link>
            ) : (
              <span className="inline-flex items-center rounded-full border border-border/50 bg-background/60 px-4 py-2 text-sm text-muted-foreground">
                Next
              </span>
            )}
          </div>
        </nav>
      )}
    </>
  );
}
