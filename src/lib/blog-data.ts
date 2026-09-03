import type { BlogStage } from "@/lib/blog-stage";

const BLOG_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const FUTURE_BLOG_GRACE_PERIOD_MS = 1000 * 60 * 60 * 24;
const DEFAULT_BLOG_IMAGE = "/images/blog/default.webp";
const TOP_TAG_LIMIT = 5;

export interface BlogDateFields {
  date: string;
  updated?: string;
}

export interface BlogTagFields {
  tags: string[];
}

/**
 * Whether a post is live yet, decided from its RAW front-matter date.
 *
 * This rule lives here and nowhere else, and it has to be asked *before*
 * `clampBlogDateToToday` runs. The clamp rewrites a future date to today, so a
 * clamped record can never look unpublished and any date comparison downstream
 * of the clamp is a no-op that silently passes everything. `readBlog` asks this
 * of the raw date and stores the answer as `published`; every consumer reads
 * the flag instead of re-deriving it.
 */
export function isBlogPublished(date: string, now: Date = new Date()): boolean {
  const time = new Date(date).getTime();
  if (!Number.isFinite(time)) return false;
  return time <= now.getTime() + FUTURE_BLOG_GRACE_PERIOD_MS;
}

export interface BlogPublicationFields extends BlogDateFields {
  /** Decided once, at the read seam, from the unclamped front-matter date. */
  published: boolean;
}

export interface BlogReadingTimeFields {
  /** `calculateReadingTime` minutes, computed once at the read seam. */
  readingTimeMinutes: number;
  words: number;
}

export type BlogStatsSource = BlogTagFields & BlogReadingTimeFields;

export interface BlogPreviewSource extends BlogDateFields, BlogTagFields {
  slug: string;
  title: string;
  description: string;
  image?: string;
  stage?: BlogStage;
}

export interface BlogPreview extends BlogDateFields, BlogTagFields {
  slug: string;
  title: string;
  description: string;
  image: string;
  stage?: BlogStage;
}

export interface BlogTagCount {
  tag: string;
  count: number;
}

export interface BlogStatsSummary {
  totalPosts: number;
  totalReadingTime: number;
  avgReadingTime: number;
  topTags: BlogTagCount[];
}

export function getTodayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function clampBlogDateToToday(date: string): string {
  if (!BLOG_DATE_PATTERN.test(date)) {
    return date;
  }

  const today = getTodayIsoDate();
  return date > today ? today : date;
}

export function parseBlogIsoDate(date: string | undefined): Date | undefined {
  if (!date || !BLOG_DATE_PATTERN.test(date)) return undefined;
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export function getBlogLastModified(
  blog: BlogDateFields,
  fallback: Date = new Date()
): Date {
  return parseBlogIsoDate(blog.updated) ?? parseBlogIsoDate(blog.date) ?? fallback;
}

export function sortBlogsByDateDescending<T extends BlogDateFields>(
  blogs: readonly T[]
): T[] {
  return [...blogs].sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Newest-first list of the posts that are live. Reads the `published` flag
 * `readBlog` computed; it deliberately does not look at `date` again, because
 * by the time a record gets here its date has been clamped for display.
 */
export function getPublishedBlogs<T extends BlogPublicationFields>(
  blogs: readonly T[]
): T[] {
  return blogs
    .filter((blog) => blog.published)
    .sort((a, b) => b.date.localeCompare(a.date));
}

function getTopTags<T extends BlogTagFields>(
  blogs: readonly T[],
  limit: number = TOP_TAG_LIMIT
): BlogTagCount[] {
  const tagCounts = new Map<string, number>();

  blogs.forEach((blog) => {
    blog.tags.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });

  return Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function getBlogStats<T extends BlogStatsSource>(
  blogs: readonly T[]
): BlogStatsSummary {
  const totalPosts = blogs.length;
  const totalReadingTime = blogs.reduce(
    (total, blog) => total + blog.readingTimeMinutes,
    0
  );

  return {
    totalPosts,
    totalReadingTime,
    avgReadingTime: totalPosts > 0 ? Math.round(totalReadingTime / totalPosts) : 0,
    topTags: getTopTags(blogs),
  };
}

export function toBlogPreview<T extends BlogPreviewSource>(blog: T): BlogPreview {
  return {
    slug: blog.slug,
    title: blog.title,
    description: blog.description,
    date: blog.date,
    tags: blog.tags,
    image: blog.image || DEFAULT_BLOG_IMAGE,
    stage: blog.stage,
  };
}

/**
 * The homepage's single source of blog sections. Both halves come off the same
 * published list, so the "latest" strip and the themed index can never disagree
 * about what has shipped.
 */
export function splitHomepageBlogs<
  T extends BlogPreviewSource & BlogPublicationFields,
>(
  blogs: readonly T[],
  { recentCount = 3 }: { recentCount?: number } = {}
): {
  publishedBlogs: BlogPreview[];
  recentBlogs: BlogPreview[];
} {
  const publishedBlogs = getPublishedBlogs(blogs).map(toBlogPreview);

  return {
    publishedBlogs,
    recentBlogs: publishedBlogs.slice(0, recentCount),
  };
}
