import { Container } from "@/components/Container";
import { getAllBlogs } from "@/lib/getAllBlogs";
import { BlogGrid } from "@/components/blog/BlogGrid";
import { ThemedBlogSections } from "@/components/blog/ThemedBlogSections";
import { BLOG_STAGES, STAGE_LABELS, filterByStage } from "@/lib/blog-stage";
import { getBlogArchiveHref } from "@/lib/blog-archive-href";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Tag } from "lucide-react";
import type { Metadata } from "next";
import { toBlogPreview } from "@/lib/blog-data";
import { buildPageMetadata } from "@/lib/seo";
import { spellCount, pluralize } from "@/lib/spell-count";
import {
  readPageParam,
  readSearchParam,
  type SearchParamValue,
} from "@/lib/search-params";

interface Blog {
  slug: string;
  title: string;
  description: string;
  date: string;
  image: string;
  tags: string[];
}

const BLOGS_PER_PAGE = 12;

/**
 * The essay count is derived. Typed into four separate strings, it was correct
 * on the day it was written and silently wrong on the day the eighty-fourth
 * essay landed — the same failure mode `/books` shipped with "three books".
 */
export async function generateMetadata(): Promise<Metadata> {
  const published = (await getAllBlogs()).filter((blog) => blog.published);

  return buildPageMetadata({
    title: "Writing",
    description: `${spellCount(published.length)} ${pluralize(
      published.length,
      "essay"
    )} on power, attention, philosophy, economics and the systems that carry them, by Lorenzo Scaturchio.`,
    path: "/blog",
    cardType: "blog",
  });
}

// Revalidate the blog listing every hour for fresh content
export const revalidate = 3600;

export default async function Blog({
  searchParams,
}: {
  searchParams?: Promise<Record<string, SearchParamValue>>;
}) {
  const params = (await searchParams) ?? {};
  const tagFilter = readSearchParam(params, "tag");
  const stageFilter = readSearchParam(params, "stage");
  const requestedPage = readPageParam(params);
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
  const hasActiveFilter = Boolean(normalizedTag || stageFilter);
  const themedBlogs = filteredBlogs.map(toBlogPreview);
  // Counted off the tag-filtered list, so the numbers describe what a click
  // would actually return rather than the whole corpus.
  const stageCounts = BLOG_STAGES.map((stage) => ({
    stage,
    label: STAGE_LABELS[stage].label,
    blurb: STAGE_LABELS[stage].blurb,
    count: tagFilteredBlogs.filter((blog) => blog.stage === stage).length,
  })).filter(({ count }) => count > 0);

  return (
    <Container size="wide">
      <div className="space-y-10">
        <header className="pt-4">
          <span className="label-mono block">Essays, Notes &amp; Experiments</span>
          <h1 className="text-page-title mt-4 max-w-2xl text-balance">
            Essays on AI, software, and the world they&apos;re reshaping.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Mostly arguments about power, money, and attention — with notes on the systems I
            build in between. Grouped by what they are about; filter by tag or stage for the
            date-ordered archive.
          </p>
          {/* The lede has always said "filter by stage for the date-ordered
              archive", and the page rendered no control that could set one:
              `hasActiveFilter` gated a real paginated archive reachable only
              by typing ?stage= into the URL. A promise in the copy with no
              affordance under it is worse than no promise. Counts are derived,
              so a stage with no essays says so rather than offering a dead
              filter. */}
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              href="/topics"
              prefetch={false}
              className="label-mono label-link inline-flex items-center gap-2 text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
            >
              <Tag className="h-3.5 w-3.5" />
              Browse by topic
            </Link>

            <span aria-hidden className="label-mono text-foreground/25">·</span>

            {/* The site's one stage filter.
                There were two, 97px apart, disagreeing about what selected
                looks like: this row used forest ink plus an underline and
                carried counts but had no "All", while `BlogGrid` rendered its
                own `Stage · All · SEEDLING · …` nav below, selecting with
                ink-versus-muted at 11.52px — the weakest signal the system
                has. Same word, same href, same concept, one screen, two
                answers, which teaches a reader that neither is authoritative.
                This one keeps the counts and the stronger affordance and gains
                the "All" the other had; the duplicate is gone.

                The hrefs now go through `getBlogArchiveHref`, so choosing a
                stage preserves an active tag and resets to page 1 instead of
                dropping the tag on the floor. */}
            <nav aria-label="Filter by stage" className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {/* A visible label, because the row had one and it was the wrong
                  one. "BROWSE BY TOPIC" sat immediately left of these four
                  controls, in the same mono and in `text-foreground` — darker
                  than the stage links — so it read as their caption: a label
                  naming *topics* over controls that filter *stages*. It is a
                  link to another page, not a heading for this one. Naming the
                  stage row takes the caption role away from it. */}
              <span className="label-mono text-foreground/70">Stage</span>
              <Link
                href={getBlogArchiveHref(1, normalizedTag, "")}
                prefetch={false}
                aria-current={stageFilter ? undefined : "page"}
                className={cn(
                  "label-mono label-link underline-offset-4 transition-colors hover:text-primary hover:underline",
                  stageFilter ? "text-muted-foreground" : "text-primary underline"
                )}
              >
                All {tagFilteredBlogs.length}
              </Link>
              {stageCounts.map(({ stage, label, count }) => {
                const active = stageFilter === stage;
                return (
                  <Link
                    key={stage}
                    href={getBlogArchiveHref(1, normalizedTag, active ? "" : stage)}
                    prefetch={false}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "label-mono label-link underline-offset-4 transition-colors hover:text-primary hover:underline",
                      active ? "text-primary underline" : "text-muted-foreground"
                    )}
                  >
                    {label} {count}
                  </Link>
                );
              })}
            </nav>
          </div>
          {/* The vocabulary, printed.
              SEEDLING / BUDDING / EVERGREEN is the site's most distinctive
              editorial idea and its least legible control: the gloss lived
              only in a native `title=` tooltip and in `sr-only` text, so on a
              phone — where there is no hover — the words were unlearnable, and
              a reader met "BUDDING" on an essay with no way to find out what
              it claimed. One line costs less than a vocabulary nobody can
              read. */}
          <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            {stageCounts.map(({ stage, label, blurb }, index) => (
              <span key={stage} className="inline-flex items-center gap-x-3">
                {index > 0 && (
                  <span aria-hidden className="text-foreground/25">·</span>
                )}
                <span>
                  {/* The name is a label; the gloss is a sentence.
                      Wrapping the whole line in `label-mono` uppercased the
                      explanation too — "ROUGH NOTES, STILL FORMING" — which is
                      the Wall Label Rule absorbing the content it exists to
                      caption, the exact failure a review named on the essay
                      masthead. Only the name wears the label voice. */}
                  <span className="label-mono text-foreground">{label}</span>{" "}
                  {blurb.replace(/\.$/, "")}
                </span>
              </span>
            ))}
          </p>

          <hr className="gallery-rule mt-8" />
        </header>

        {hasActiveFilter ? (
          <BlogGrid
            blogs={visibleBlogs}
            currentPage={currentPage}
            pageStart={pageStart}
            tagFilter={tagFilter}
            stageFilter={stageFilter}
            totalBlogs={filteredBlogs.length}
            totalPages={totalPages}
          />
        ) : (
          <ThemedBlogSections posts={themedBlogs} />
        )}
      </div>
    </Container>
  );
}
