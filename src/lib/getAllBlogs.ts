import glob from "fast-glob";
import * as path from "path";
import fs from "fs/promises";

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
  let { meta, default: component } = await import(
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
  let blogFileNames = await glob(["*.mdx", "*/content.mdx"], {
    cwd: path.join(process.cwd(), "src/app/blog"),
  });

  let blogs = await Promise.all(blogFileNames.map(importBlog));

  return blogs.sort((a, b) => b.date.localeCompare(a.date));
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
