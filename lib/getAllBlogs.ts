import glob from "fast-glob";
import * as path from "path";
import fs from "fs/promises";

interface BlogMeta {
  date: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
}

interface Blog extends BlogMeta {
  slug: string;
}

function extractMetaFromContent(content: string, fileName: string): BlogMeta {
  const metaMatch = content.match(/export const meta = ({[\s\S]*?});/);
  if (!metaMatch) {
    throw new Error(`No meta export found in ${fileName}`);
  }

  try {
    // Safely evaluate the meta object
    const meta = eval(`(${metaMatch[1]})`) as BlogMeta;
    
    // Validate required fields
    if (!meta.date || !meta.title || !meta.description) {
      throw new Error(`Missing required meta fields in ${fileName}`);
    }
    
    return meta;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse meta in ${fileName}: ${errorMessage}`);
  }
}

async function importBlog(blogFileName: string): Promise<Blog> {
  const fullPath = path.join(process.cwd(), "src/app/blog", blogFileName);
  
  try {
    const fileContents = await fs.readFile(fullPath, "utf8");
    const meta = extractMetaFromContent(fileContents, blogFileName);

    return {
      slug: blogFileName.replace(/\/content\.mdx$/, ""),
      ...meta,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to import blog ${blogFileName}: ${errorMessage}`);
  }
}

export async function getAllBlogs(): Promise<Blog[]> {
  const blogDir = path.join(process.cwd(), "src/app/blog");
  
  try {
    const blogFileNames = await glob(["*/content.mdx"], {
      cwd: blogDir,
    });

    const blogs = await Promise.all(blogFileNames.map(importBlog));
    return blogs.sort((a, b) => b.date.localeCompare(a.date));
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to get all blogs: ${errorMessage}`);
  }
}
