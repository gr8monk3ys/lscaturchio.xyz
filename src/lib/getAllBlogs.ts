/**
 * The essay catalogue: the one place that answers "which essays, in what
 * order".
 *
 * Every default answer is PUBLISHED essays only, newest first. A scheduled post
 * (front-matter date in the future) is invisible unless a caller opts in with
 * `includeScheduled`, and only three kinds of caller have a reason to: the
 * essay route itself (a scheduled slug still renders at its URL), the view
 * counter's existence check, and admin.
 *
 * It used to be the other way round. `getAllBlogs()` returned everything and
 * `published` was a flag each caller had to remember to read; RSS, the sitemap
 * and /api/posts were fixed one at a time, and eleven other surfaces (the
 * /blog page body, tag and topic pages, series, the podcast, stats, related
 * and popular posts) never were. Filtering here means a new surface cannot
 * forget.
 *
 * The listing queries callers kept re-deriving live here too: tag matching
 * (case-insensitive, normalised once), theme membership, and series grouping
 * with real reading-time totals. The pure rules they apply stay in
 * `blog-data.ts` and `blog-themes.ts`.
 */
import { listEssaySources, type EssaySource } from "@/lib/essay-sources";
import {
  clampBlogDateToToday,
  getPublishedBlogs,
  getTodayIsoDate,
  isBlogPublished,
  sortBlogsByDateDescending,
} from "@/lib/blog-data";
import { allThemesForTags } from "@/lib/blog-themes";
import { calculateReadingTime } from "@/lib/reading-time";
import type { BlogMeta } from "@/lib/blog-meta";

/** Disk is read at most once per minute per catalogue. */
const CACHE_TTL_MS = 60_000;

export interface BlogPost extends BlogMeta {
  slug: string;
  /**
   * The essay as plain markdown (`EssaySource.body`): no meta export, no
   * imports. The raw MDX source is deliberately not carried: the feed only
   * wanted the body, and reading time computed from the source counted the
   * front-matter as prose.
   */
  body: string;
  /**
   * Whether the post is live. Decided at the read seam, from the raw
   * front-matter date, because `date` below has been clamped and can no longer
   * answer it. Always true on a default (published-only) answer.
   */
  published: boolean;
  /** The one reading-time number the whole site quotes. */
  readingTimeMinutes: number;
  words: number;
}

export interface ListEssaysOptions {
  /**
   * Also return scheduled posts. Off by default; see the module comment for
   * the callers that need it.
   */
  includeScheduled?: boolean;
}

export interface EssaySeries {
  name: string;
  /** Reading order: `seriesOrder` ascending. */
  posts: BlogPost[];
  totalPosts: number;
  /** The sum of each post's `readingTimeMinutes`, not an estimate. */
  totalReadingTime: number;
}

export interface EssayCatalogueOptions {
  /** Where the essays live. Defaults to `essayRoot()`. */
  blogDir?: string;
  /** The clock publication and the display clamp are judged against. */
  now?: () => Date;
}

function toBlogPost(essay: EssaySource, now: Date): BlogPost {
  const { meta, body } = essay;
  // `listEssaySources` has already guaranteed title and date parse.
  const title = meta.title as string;
  const date = meta.date as string;

  // Order matters. Publication is judged on the raw date; the clamp that
  // follows is purely a display concern, so a mis-dated post still renders a
  // sane date instead of one from 2999.
  const published = isBlogPublished(date, now);
  const today = getTodayIsoDate(now);
  const publishDate = clampBlogDateToToday(date, today);
  const updatedDate = meta.updated
    ? clampBlogDateToToday(meta.updated, today)
    : undefined;
  const reading = calculateReadingTime(body);

  return {
    slug: essay.slug,
    body,
    title,
    description: meta.description || "",
    date: publishDate,
    updated: updatedDate,
    image: meta.image || "/images/blog/default.webp",
    tags: meta.tags || [],
    syndication: meta.syndication,
    series: meta.series,
    seriesOrder: meta.seriesOrder,
    stage: meta.stage,
    published,
    readingTimeMinutes: reading.minutes,
    words: reading.words,
  };
}

/**
 * Build a catalogue over one essay root and one clock. The module exports a
 * default instance below; tests build their own over a fixture tree.
 */
export function createEssayCatalogue({
  blogDir,
  now = () => new Date(),
}: EssayCatalogueOptions = {}) {
  let cached: BlogPost[] | null = null;
  let cachedAt = 0;

  async function readAll(): Promise<BlogPost[]> {
    const at = now();
    if (cached && at.getTime() - cachedAt < CACHE_TTL_MS) {
      return cached;
    }

    // A post with no title or no date cannot be rendered or ordered, so the
    // render path asks for both; malformed sources are dropped, not fatal.
    const essays = await listEssaySources({
      blogDir,
      requiredMeta: ["title", "date"],
    });
    cached = sortBlogsByDateDescending(
      essays.map((essay) => toBlogPost(essay, at))
    );
    cachedAt = at.getTime();
    return cached;
  }

  async function getAllBlogs(
    options: ListEssaysOptions = {}
  ): Promise<BlogPost[]> {
    const all = await readAll();
    return options.includeScheduled ? [...all] : getPublishedBlogs(all);
  }

  async function getBlogsByTag(tag: string): Promise<BlogPost[]> {
    const needle = tag.trim().toLowerCase();
    if (!needle) return [];
    return (await getAllBlogs()).filter((blog) =>
      blog.tags.some((t) => t.toLowerCase() === needle)
    );
  }

  async function getBlogsInTheme(themeSlug: string): Promise<BlogPost[]> {
    return (await getAllBlogs()).filter((blog) =>
      allThemesForTags(blog.tags).some((theme) => theme.slug === themeSlug)
    );
  }

  async function listSeries(): Promise<EssaySeries[]> {
    const bySeries = new Map<string, BlogPost[]>();
    for (const blog of await getAllBlogs()) {
      if (!blog.series) continue;
      const posts = bySeries.get(blog.series);
      if (posts) posts.push(blog);
      else bySeries.set(blog.series, [blog]);
    }

    return Array.from(bySeries, ([name, posts]) => {
      const ordered = [...posts].sort(
        (a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0)
      );
      return {
        name,
        posts: ordered,
        totalPosts: ordered.length,
        totalReadingTime: ordered.reduce(
          (total, post) => total + post.readingTimeMinutes,
          0
        ),
      };
    }).sort((a, b) => b.totalPosts - a.totalPosts);
  }

  async function getBlogPost(slug: string): Promise<BlogPost | undefined> {
    return (await readAll()).find((blog) => blog.slug === slug);
  }

  return {
    getAllBlogs,
    getBlogsByTag,
    getBlogsInTheme,
    listSeries,
    getBlogPost,
  };
}

const catalogue = createEssayCatalogue();

/**
 * Published essays, newest first. Pass `{ includeScheduled: true }` only from
 * the essay route, the view counter's existence check, or admin.
 */
export function getAllBlogs(options?: ListEssaysOptions): Promise<BlogPost[]> {
  return catalogue.getAllBlogs(options);
}

/** Published essays carrying `tag`, matched case-insensitively. Newest first. */
export function getBlogsByTag(tag: string): Promise<BlogPost[]> {
  return catalogue.getBlogsByTag(tag);
}

/**
 * Published essays in a theme by ALL-themes membership (any matching tag), so
 * an essay can count toward several /topics hubs. Newest first.
 */
export function getBlogsInTheme(themeSlug: string): Promise<BlogPost[]> {
  return catalogue.getBlogsInTheme(themeSlug);
}

/**
 * Every series among published essays, largest first, each in reading order
 * with its real total reading time.
 */
export function listSeries(): Promise<EssaySeries[]> {
  return catalogue.listSeries();
}

/**
 * One essay by slug, scheduled or not, because the essay route renders
 * scheduled essays at their URL. Undefined when the slug has no source, or
 * its meta has no title or date.
 *
 * This is the record the essay page renders: the clamped dates, the reading
 * time every other surface quotes, and the default cover. The essay shell used
 * to take the MDX's raw `meta` instead, re-apply the clamp, and look the
 * reading time back up here by slug.
 */
export function getBlogPost(slug: string): Promise<BlogPost | undefined> {
  return catalogue.getBlogPost(slug);
}
