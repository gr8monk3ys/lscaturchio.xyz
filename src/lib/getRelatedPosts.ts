// Rule: TypeScript Usage - Use TypeScript for all code
import { getAllBlogs } from "./getAllBlogs";

export interface RelatedPost {
  title: string;
  slug: string;
  description: string;
  date: string;
  image: string;
  tags: string[];
}

/**
 * Get related posts based on matching tags
 * @param currentSlug Slug of the current blog post to exclude
 * @param currentTags Tags of the current blog post to match against
 * @param limit Maximum number of related posts to return
 * @returns Array of related blog posts
 */
export async function getRelatedPosts(
  currentSlug: string,
  currentTags: string[],
  limit = 3
): Promise<RelatedPost[]> {
  // Get all blog posts
  const allBlogs = await getAllBlogs();
  
  // Remove the current post and calculate tag overlap scores
  const otherBlogs = allBlogs
    .filter(blog => blog.slug !== currentSlug)
    .map(blog => {
      // Count matching tags
      const matchingTags = blog.tags.filter((tag: string) => 
        currentTags.includes(tag)
      );
      
      // Calculate relevance score
      const score = matchingTags.length;
      
      return {
        ...blog,
        score
      };
    })
    // Sort by score (descending), then by date (newest first)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    })
    // Take the top N results
    .slice(0, limit);
  
  return otherBlogs;
}
