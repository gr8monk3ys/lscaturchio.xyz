// Rule: TypeScript Usage - Use TypeScript for all code
import { getFallbackBlogs, FallbackBlog } from "./fallbackBlogData";

export interface SearchResult {
  title: string;
  slug: string;
  description: string;
  date: string;
  tags: string[];
  excerpt?: string;
  relevance: number;
}

/**
 * Search blog posts by query string
 * @param query Search query
 * @returns Promise with array of search results
 */
export async function searchBlogPosts(query: string): Promise<SearchResult[]> {
  if (!query || query.trim() === "") {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();
  const queryTerms = normalizedQuery.split(/\s+/).filter(term => term.length > 1);
  
  if (queryTerms.length === 0) {
    return [];
  }

  // Get all blog posts from fallback data
  const allBlogs = getFallbackBlogs();
  
  // Search through blog posts
  const results = allBlogs
    .map((blog: FallbackBlog) => {
      const titleMatches = countMatches(blog.title, queryTerms);
      const descriptionMatches = countMatches(blog.description, queryTerms);
      const tagMatches = blog.tags.reduce((count: number, tag: string) => 
        count + countMatches(tag, queryTerms), 0);
      
      // Calculate relevance score - title matches are weighted more heavily
      const relevance = (titleMatches * 3) + descriptionMatches + tagMatches;
      
      // Only include results with at least one match
      if (relevance > 0) {
        // Generate excerpt with highlighted query terms
        const excerpt = generateExcerpt(blog.description, queryTerms);
        
        return {
          title: blog.title,
          slug: blog.slug,
          description: blog.description,
          date: blog.date,
          tags: blog.tags,
          excerpt,
          relevance
        } as SearchResult;
      }
      
      return null;
    })
    .filter((result: SearchResult | null): result is SearchResult => result !== null)
    .sort((a: SearchResult, b: SearchResult) => b.relevance - a.relevance);
  
  return results;
}

/**
 * Count number of query term matches in a text
 */
function countMatches(text: string, queryTerms: string[]): number {
  const normalizedText = text.toLowerCase();
  return queryTerms.reduce((count, term) => 
    normalizedText.includes(term) ? count + 1 : count, 0);
}

/**
 * Generate excerpt with highlighted query terms
 */
function generateExcerpt(text: string, queryTerms: string[]): string {
  const normalizedText = text.toLowerCase();
  
  // Find the first occurrence of any query term
  let startPos = -1;
  for (const term of queryTerms) {
    const pos = normalizedText.indexOf(term);
    if (pos !== -1 && (startPos === -1 || pos < startPos)) {
      startPos = pos;
    }
  }
  
  // If no matches found, return the beginning of the text
  if (startPos === -1) {
    return text.slice(0, 120) + "...";
  }
  
  // Create an excerpt centered around the first match
  const excerptStart = Math.max(0, startPos - 60);
  const excerptEnd = Math.min(text.length, startPos + 100);
  let excerpt = text.slice(excerptStart, excerptEnd);
  
  // Add ellipsis if needed
  if (excerptStart > 0) {
    excerpt = "..." + excerpt;
  }
  if (excerptEnd < text.length) {
    excerpt = excerpt + "...";
  }
  
  return excerpt;
}
