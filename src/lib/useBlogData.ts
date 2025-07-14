// Rule: TypeScript Usage - Use TypeScript for all code
import { getAllPostMetadata, getPostMetadata, BlogPostMetadata } from '@/app/blog/metadata';

// Define the blog data interface
export interface BlogData {
  title: string;
  slug: string;
  description: string;
  date: string;
  image: string;
  tags: string[];
  content?: string;
}

// Define return types for hooks
export interface BlogHookResult {
  blogs: BlogData[];
  isLoading: boolean;
  isError: Error | null;
  mutate: () => Promise<BlogData[] | undefined>;
}

export interface SingleBlogHookResult {
  blog: BlogData | null;
  isLoading: boolean;
  isError: Error | null;
}

/**
 * Custom hook to get all blog posts from centralized metadata
 */
export function useAllBlogs(): BlogHookResult {
  // Use the centralized metadata system
  const allPosts = getAllPostMetadata().map(post => {
    const typedPost = post as BlogPostMetadata & { slug: string };
    return {
      ...typedPost,
      slug: typedPost.slug,
    };
  });
  
  return {
    blogs: allPosts as BlogData[],
    isLoading: false,
    isError: null,
    mutate: () => Promise.resolve(allPosts as BlogData[])
  };
}

/**
 * Custom hook to get a single blog post by slug
 */
export function useBlogBySlug(slug: string): SingleBlogHookResult {
  const post = getPostMetadata(slug);
  
  if (!post) {
    return {
      blog: null,
      isLoading: false,
      isError: null
    };
  }
  
  return {
    blog: { ...post, slug } as BlogData,
    isLoading: false,
    isError: null
  };
}

/**
 * Custom hook to get blog posts by tag
 */
export function useBlogsByTag(tag: string): BlogHookResult {
  // Filter posts by tag from centralized metadata
  const filteredPosts = getAllPostMetadata()
    .filter(post => post.tags.some(t => t.toLowerCase() === tag.toLowerCase()))
    .map(post => {
      const typedPost = post as BlogPostMetadata & { slug: string };
      return {
        ...typedPost,
        slug: typedPost.slug,
      };
    });
  
  return {
    blogs: filteredPosts as BlogData[],
    isLoading: false,
    isError: null,
    mutate: () => Promise.resolve(filteredPosts as BlogData[])
  };
}
