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

export interface BlogContentFields extends BlogDateFields, BlogTagFields {
  content: string;
}

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

export function getPublishedBlogs<T extends BlogDateFields>(
  blogs: readonly T[],
  now: Date = new Date()
): T[] {
  return blogs
    .map((blog) => ({ blog, time: new Date(blog.date).getTime() }))
    .filter(({ time }) => Number.isFinite(time))
    .filter(({ time }) => time <= now.getTime() + FUTURE_BLOG_GRACE_PERIOD_MS)
    .sort((a, b) => b.time - a.time)
    .map(({ blog }) => blog);
}

function getReadingTimeFromContent(content: string): number {
  return Math.ceil(content.length / 1000) * 5;
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

export function getBlogStats<T extends BlogContentFields>(
  blogs: readonly T[]
): BlogStatsSummary {
  const totalPosts = blogs.length;
  const totalReadingTime = blogs.reduce(
    (total, blog) => total + getReadingTimeFromContent(blog.content),
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

export function splitHomepageBlogs<T extends BlogPreviewSource>(
  blogs: readonly T[],
  {
    now = new Date(),
    recentCount = 3,
    selectedCount = 8,
  }: {
    now?: Date;
    recentCount?: number;
    selectedCount?: number;
  } = {}
): {
  recentBlogs: BlogPreview[];
  selectedWriting: BlogPreview[];
} {
  const publishedBlogs = getPublishedBlogs(blogs, now);
  const recentBlogsRaw = publishedBlogs.slice(0, recentCount);
  const recentSlugs = new Set(recentBlogsRaw.map((blog) => blog.slug));

  return {
    recentBlogs: recentBlogsRaw.map(toBlogPreview),
    selectedWriting: publishedBlogs
      .filter((blog) => !recentSlugs.has(blog.slug))
      .slice(0, selectedCount)
      .map(toBlogPreview),
  };
}
