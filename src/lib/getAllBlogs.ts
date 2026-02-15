import glob from "fast-glob";
import * as path from "path";
import fs from "fs/promises";
import { extractBlogMeta } from "@/lib/blog-meta";

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
}

export interface BlogPost extends BlogMeta {
  slug: string;
  content: string;
}

function getTodayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function clampToToday(date: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }

  const today = getTodayIsoDate();
  return date > today ? today : date;
}

async function readBlog(fileName: string): Promise<BlogPost | null> {
  const blogDir = path.join(process.cwd(), "src/app/blog");
  const filePath = path.join(blogDir, fileName);
  const content = await fs.readFile(filePath, "utf-8");
  const meta = extractBlogMeta(content);

  if (!meta.title || !meta.date) return null;

  const publishDate = clampToToday(meta.date);
  const updatedDate = meta.updated ? clampToToday(meta.updated) : undefined;

  return {
    slug: fileName.replace(/(\/content)?\.mdx$/, ""),
    content,
    title: meta.title,
    description: meta.description || "",
    date: publishDate,
    updated: updatedDate,
    image: meta.image || "/images/blog/default.webp",
    tags: meta.tags || [],
    syndication: meta.syndication,
    series: meta.series,
    seriesOrder: meta.seriesOrder,
  };
}

export async function getAllBlogs(): Promise<BlogPost[]> {
  const now = Date.now();
  if (cachedBlogs && now - cacheTime < CACHE_TTL) {
    return cachedBlogs;
  }

  const blogFileNames = await glob(["*.mdx", "*/content.mdx"], {
    cwd: path.join(process.cwd(), "src/app/blog"),
  });

  const results = await Promise.all(blogFileNames.map(readBlog));
  const blogs = results.filter((b): b is BlogPost => b !== null);
  const sortedBlogs = blogs.sort((a, b) => b.date.localeCompare(a.date));

  cachedBlogs = sortedBlogs;
  cacheTime = now;

  return sortedBlogs;
}

/**
 * Clear the blog cache.
 */
export function clearBlogCache(): void {
  cachedBlogs = null;
  cacheTime = 0;
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
