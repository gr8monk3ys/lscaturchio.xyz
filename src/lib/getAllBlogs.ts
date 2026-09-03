import { listEssaySources, type EssaySource } from "@/lib/essay-sources";
import {
  clampBlogDateToToday,
  isBlogPublished,
  sortBlogsByDateDescending,
} from "@/lib/blog-data";
import { calculateReadingTime } from "@/lib/reading-time";
import type { BlogStage } from "@/lib/blog-stage";

// Module-level cache for getAllBlogs() to avoid repeated disk reads
let cachedBlogs: BlogPost[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 60000; // 1 minute cache TTL

interface BlogMeta {
  title: string;
  description: string;
  date: string;
  updated?: string;
  image: string;
  tags: string[];
  syndication?: string[];
  series?: string;
  seriesOrder?: number;
  stage?: BlogStage;
}

export interface BlogPost extends BlogMeta {
  slug: string;
  content: string;
  /**
   * Whether the post is live. Decided here, from the raw front-matter date,
   * because `date` below has been clamped and can no longer answer it.
   */
  published: boolean;
  /** The one reading-time number the whole site quotes. */
  readingTimeMinutes: number;
  words: number;
}

function toBlogPost(essay: EssaySource): BlogPost {
  const { meta, source: content } = essay;
  // `listEssaySources` has already guaranteed title and date parse.
  const title = meta.title as string;
  const date = meta.date as string;

  // Order matters. Publication is judged on the raw date; the clamp that
  // follows is purely a display concern, so a mis-dated post still renders a
  // sane date instead of one from 2999.
  const published = isBlogPublished(date);
  const publishDate = clampBlogDateToToday(date);
  const updatedDate = meta.updated ? clampBlogDateToToday(meta.updated) : undefined;
  const reading = calculateReadingTime(content);

  return {
    slug: essay.slug,
    content,
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

export async function getAllBlogs(): Promise<BlogPost[]> {
  const now = Date.now();
  if (cachedBlogs && now - cacheTime < CACHE_TTL) {
    return cachedBlogs;
  }

  // A post with no title or no date cannot be rendered or ordered, so the
  // render path asks for both; malformed sources are dropped, not fatal.
  const essays = await listEssaySources({ requiredMeta: ["title", "date"] });
  const sortedBlogs = sortBlogsByDateDescending(essays.map(toBlogPost));

  cachedBlogs = sortedBlogs;
  cacheTime = now;

  return sortedBlogs;
}

/**
 * Get all posts from the same series
 */
export async function getSeriesPosts(seriesName: string): Promise<BlogPost[]> {
  const allBlogs = await getAllBlogs();
  const seriesPosts = allBlogs.filter(
    (blog) => blog.series === seriesName
  );
  return seriesPosts.sort((a, b) => {
    const orderA = a.seriesOrder ?? 0;
    const orderB = b.seriesOrder ?? 0;
    return orderA - orderB;
  });
}
