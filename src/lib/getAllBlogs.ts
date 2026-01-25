import glob from "fast-glob";
import * as path from "path";
import fs from "fs/promises";

// Module-level cache for getAllBlogs() to avoid repeated disk reads
// This significantly improves performance for API routes that call getAllBlogs()
let cachedBlogs: BlogPost[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 60000; // 1 minute cache TTL

interface BlogMeta {
  title: string;
  description: string;
  date: string;
  updated?: string; // Optional last updated date
  image: string;
  tags: string[];
  series?: string; // Optional series name
  seriesOrder?: number; // Order within the series (1, 2, 3...)
}

interface BlogPost extends BlogMeta {
  slug: string;
  content: string;
  component: React.ComponentType;
}

async function importBlog(blogFileNames: string): Promise<BlogPost> {
  const { meta, default: component } = await import(
    `../app/blog/${blogFileNames}`
  );

  // Read the MDX file content
  const filePath = path.join(process.cwd(), "src/app/blog", blogFileNames);
  const content = await fs.readFile(filePath, "utf-8");

  return {
    slug: blogFileNames.replace(/(\/content)?\.mdx$/, ""),
    content,
    ...meta,
    component,
  };
}

export async function getAllBlogs(): Promise<BlogPost[]> {
  // Return cached blogs if cache is still valid
  const now = Date.now();
  if (cachedBlogs && now - cacheTime < CACHE_TTL) {
    return cachedBlogs;
  }

  const blogFileNames = await glob(["*.mdx", "*/content.mdx"], {
    cwd: path.join(process.cwd(), "src/app/blog"),
  });

  const blogs = await Promise.all(blogFileNames.map(importBlog));

  const sortedBlogs = blogs.sort((a, b) => b.date.localeCompare(a.date));

  // Update cache
  cachedBlogs = sortedBlogs;
  cacheTime = now;

  return sortedBlogs;
}

/**
 * Clear the blog cache. Useful for development or when blog content changes.
 */
export function clearBlogCache(): void {
  cachedBlogs = null;
  cacheTime = 0;
}

/**
 * Get all posts from the same series
 * @param seriesName - The name of the series
 * @returns Array of blog posts sorted by seriesOrder
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
