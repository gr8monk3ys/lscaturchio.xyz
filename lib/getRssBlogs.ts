// Rule: TypeScript Usage - Use TypeScript for all code
import glob from "fast-glob";
import * as path from "path";
import fs from "fs/promises";

interface RssBlogMeta {
  date: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
}

export interface RssBlog extends RssBlogMeta {
  slug: string;
  content: string;
}

// Extract meta from MDX content without importing the React components
function extractMetaFromMdx(content: string, fileName: string): RssBlogMeta {
  const metaMatch = content.match(/export const meta = ({[\s\S]*?});/);
  if (!metaMatch) {
    throw new Error(`No meta export found in ${fileName}`);
  }

  try {
    // Extract the meta object as a string and safely parse it
    const metaString = metaMatch[1]
      .replace(/(\w+):/g, '"$1":') // Convert property names to quoted strings
      .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
      .replace(/'/g, '"'); // Replace single quotes with double quotes
    
    const metaObj = JSON.parse(metaString);
    
    return {
      date: metaObj.date || "",
      title: metaObj.title || "",
      description: metaObj.description || "",
      image: metaObj.image || "",
      tags: metaObj.tags || [],
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Failed to parse meta in ${fileName}: ${errorMessage}`);
    
    // Return a fallback object with empty values
    return {
      date: "",
      title: fileName,
      description: "",
      image: "",
      tags: [],
    };
  }
}

// Extract markdown content from MDX file
function extractMarkdownContent(fileContent: string): string {
  // Remove the meta export and any imports at the top
  const contentWithoutMeta = fileContent
    .replace(/import.*?;[\r\n]*/g, '')
    .replace(/export const meta = \{[\s\S]*?\};[\r\n]*/, '');
  
  // Extract just the markdown content
  return contentWithoutMeta.trim();
}

// Get blog data for RSS without importing MDX files directly
export async function getRssBlogs(): Promise<RssBlog[]> {
  const blogDir = path.join(process.cwd(), "src/app/blog");
  
  try {
    // Find all MDX content files
    const blogFileNames = await glob(["*/content.mdx"], {
      cwd: blogDir,
    });

    const blogs = await Promise.all(
      blogFileNames.map(async (fileName) => {
        const fullPath = path.join(blogDir, fileName);
        const fileContent = await fs.readFile(fullPath, "utf8");
        
        // Extract meta and content without React
        const meta = extractMetaFromMdx(fileContent, fileName);
        const content = extractMarkdownContent(fileContent);
        const slug = fileName.replace(/\/content\.mdx$/, "");
        
        return {
          ...meta,
          slug,
          content,
        };
      })
    );

    // Sort blogs by date (newest first)
    return blogs.sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Failed to get RSS blogs: ${errorMessage}`);
    return [];
  }
}
