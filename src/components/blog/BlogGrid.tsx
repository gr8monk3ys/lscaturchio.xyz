import { EssayRows } from "@/components/blog/essay-rows";
import type { BlogPreview } from "@/lib/blog-data";
import { STAGE_LABELS, isBlogStage } from "@/lib/blog-stage";
import { X } from "lucide-react";
import Link from "next/link";
import { getBlogArchiveHref } from "@/lib/blog-archive-href";

/**
 * `BlogPreview`, not a local restatement of it.
 *
 * This declared its own structural `Blog` without a `stage` field, while the
 * page has always passed `toBlogPreview` output — which carries one. The rows
 * render a stage badge from it, so the label was arriving at runtime and
 * absent from the type, and TypeScript stayed quiet because `stage` is
 * optional. A duplicated shape that silently drops a field is the same class
 * of bug as a second navigation taxonomy, one file down.
 */
interface BlogGridProps {
  blogs: BlogPreview[];
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

      {/* One heading, one count, one escape, one message.
          This block said the same thing four times. A "Filtered — zzznotatag
          · 0 posts" banner with a "Clear filter" link, then a "No blog posts
          found with the tag" paragraph with a *second* escape worded
          differently ("View all posts"), then the `h2` I added in #234 with
          its count orphaned beside it — and under all of that, at zero
          results, a 2.25rem section heading with nothing beneath it.

          A review called that fix "fixed badly" and was right: it satisfied
          the letter (the heading exists, the count is there, no heading skip)
          and left the composition worse than the defect. The heading *is* the
          banner. It names what was searched, carries the count, and holds the
          one escape. */}
      <div className="mb-6 flex flex-col items-start justify-between gap-3 border-b border-border pb-3 sm:flex-row sm:items-baseline">
        <div className="flex min-w-0 items-baseline gap-4">
          <h2 className="text-section-title">
            {stageFilter && isBlogStage(stageFilter)
              ? STAGE_LABELS[stageFilter].label.charAt(0) +
                STAGE_LABELS[stageFilter].label.slice(1).toLowerCase()
              : normalizedTag
                ? `Tagged ${normalizedTag}`
                : "Every essay"}
          </h2>
          {/* `role="status"`, so the count is announced when a filter changes
              rather than only being visible — the same node a review asked for
              beside the /projects chips. */}
          <span role="status" className="label-mono shrink-0">
            {totalBlogs}
          </span>
        </div>
        {(normalizedTag || stageFilter) && (
          <Link
            href="/blog"
            prefetch={false}
            className="label-mono label-link inline-flex shrink-0 items-center gap-1.5 text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            <X className="h-3.5 w-3.5" />
            Clear filter
          </Link>
        )}
      </div>

      {totalBlogs === 0 && (
        <p className="border-b border-border py-16 text-muted-foreground">
          Nothing here yet. The filter above will take you back.
        </p>
      )}

      {/* The same rows the unfiltered index renders.
          This was a three-column grid of full-bleed stock photography, so
          touching a stage or tag filter did not narrow /blog — it replaced it
          with a page from a different site. DESIGN.md rules that out twice:
          "Lists are stacked rows separated by hairlines … not tiled cards"
          (:237) and "most 'cards' on the site are not cards. Index pages use
          stacked rows divided by hairlines" (:308). Nobody chose the grid;
          it is what `BlogGrid` happened to render when the themed index was
          rebuilt around rows and this path was not revisited.

          The covers go with it. They were generic stock imagery — river rocks,
          sticky notes, barbed wire — which is exactly the furniture the design
          document's North Star rejects, and none of them said anything about
          the essay underneath.

          `contentVisibility` went too: it was there to keep a photo grid off
          the main thread, and a hairline list of text rows does not need it. */}
      <EssayRows posts={blogs} />

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
