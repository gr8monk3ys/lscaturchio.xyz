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
