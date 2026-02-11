import glob from "fast-glob";
import * as path from "path";
import fs from "fs/promises";

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
  series?: string;
  seriesOrder?: number;
}

export interface BlogPost extends BlogMeta {
  slug: string;
  content: string;
}

/**
 * Extract meta object from MDX/TSX file content using regex.
 * Avoids dynamic import() which causes the bundler to pull in
 * all files under src/app/blog/ (including error.tsx, loading.tsx, etc.)
 */
function extractMeta(content: string): Partial<BlogMeta> {
  const meta: Partial<BlogMeta> = {};

  const titleMatch = content.match(/title:\s*["'`]([^"'`]+)["'`]/);
  if (titleMatch) meta.title = titleMatch[1];

  const descMatch = content.match(/description:\s*["'`]([^"'`]+)["'`]/);
  if (descMatch) meta.description = descMatch[1];

  const dateMatch = content.match(/date:\s*["'`]([^"'`]+)["'`]/);
  if (dateMatch) meta.date = dateMatch[1];

  const updatedMatch = content.match(/updated:\s*["'`]([^"'`]+)["'`]/);
  if (updatedMatch) meta.updated = updatedMatch[1];

  const imageMatch = content.match(/image:\s*["'`]([^"'`]+)["'`]/);
  if (imageMatch) meta.image = imageMatch[1];

  const seriesMatch = content.match(/series:\s*["'`]([^"'`]+)["'`]/);
  if (seriesMatch) meta.series = seriesMatch[1];

  const seriesOrderMatch = content.match(/seriesOrder:\s*(\d+)/);
  if (seriesOrderMatch) meta.seriesOrder = parseInt(seriesOrderMatch[1], 10);

  // Extract tags array: tags: ["tag1", "tag2"]
  const tagsMatch = content.match(/tags:\s*\[([\s\S]*?)\]/);
  if (tagsMatch) {
    const tagStrings = tagsMatch[1].match(/["'`]([^"'`]+)["'`]/g);
    meta.tags = tagStrings
      ? tagStrings.map((t) => t.replace(/["'`]/g, ""))
      : [];
  }

  return meta;
}

async function readBlog(fileName: string): Promise<BlogPost | null> {
  const blogDir = path.join(process.cwd(), "src/app/blog");
  const filePath = path.join(blogDir, fileName);
  const content = await fs.readFile(filePath, "utf-8");
  const meta = extractMeta(content);

  if (!meta.title || !meta.date) return null;

  return {
    slug: fileName.replace(/(\/content)?\.mdx$/, ""),
    content,
    title: meta.title,
    description: meta.description || "",
    date: meta.date,
    updated: meta.updated,
    image: meta.image || "/images/blog/default.webp",
    tags: meta.tags || [],
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
