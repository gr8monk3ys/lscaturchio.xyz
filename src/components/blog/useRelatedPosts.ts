// Rule: TypeScript Usage - Use TypeScript for all code
"use client";

import { useState, useEffect } from 'react';
import { getRelatedPosts, RelatedPost } from '@/lib/getRelatedPosts';

/**
 * Custom hook to fetch related posts for a blog
 * @param slug Current blog post slug
 * @param tags Current blog post tags
 * @param limit Maximum number of related posts to fetch
 * @returns Object containing related posts and loading state
 */
export function useRelatedPosts(
  slug: string, 
  tags: string[], 
  limit = 3
): { 
  posts: RelatedPost[]; 
  isLoading: boolean; 
  error: Error | null 
} {
  const [posts, setPosts] = useState<RelatedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchRelatedPosts() {
      try {
        setIsLoading(true);
        const relatedPosts = await getRelatedPosts(slug, tags, limit);
        setPosts(relatedPosts);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch related posts:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    }

    fetchRelatedPosts();
  }, [slug, tags, limit]);

  return { posts, isLoading, error };
}
