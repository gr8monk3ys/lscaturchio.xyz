import { BlogLayout } from "@/components/blog/BlogLayout";
import { getPostMetadata, getAllPostMetadata } from '../metadata';
import { notFound } from 'next/navigation';
import { getRelatedPosts } from '@/lib/getRelatedPosts';
import { Suspense } from 'react';
import { ErrorBoundaryWrapper } from "@/components/blog/ErrorBoundaryWrapper";

// This is a Server Component
export default async function BlogPost({
  params,
}: {
  params: { slug: string };
}) {
  const slug = params.slug;
  
  // Get post metadata from centralized metadata source
  const meta = getPostMetadata(slug);
  
  // Handle non-existent posts
  if (!meta) {
    notFound();
  }
  
  // Get related posts based on tags
  const allPosts = getAllPostMetadata();
  const relatedPosts = getRelatedPosts(slug, meta.tags, allPosts);

  let MDXContent: any;

  try {
    // Dynamic import of MDX content (works in server components)
    // Using the await import directly instead of dynamic string template
    const postModule = await import(`../content/${slug}.mdx`);
    MDXContent = postModule.default;
  } catch (error) {
    console.error(`Error loading blog post: ${slug}`, error);
    // Return error state directly
    return (
      <BlogLayout 
        meta={meta} 
        relatedPosts={relatedPosts}
        slug={slug}
      >
        <div className="mdx-wrapper">
          <div className="p-4 my-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-900/30">
            <h3 className="text-xl font-space-mono text-red-700 dark:text-red-400 mb-2">Error Loading Content</h3>
            <p className="text-red-600 dark:text-red-300 font-space-mono text-sm">
              Failed to load blog content. Please try again later.
            </p>
          </div>
        </div>
      </BlogLayout>
    );
  }

  return (
    <BlogLayout 
      meta={meta} 
      relatedPosts={relatedPosts}
      slug={slug}
    >
      <div className="mdx-wrapper">
        <Suspense fallback={
          <div className="animate-pulse p-4 h-32 bg-stone-100 dark:bg-stone-800/30 rounded-md font-space-mono text-stone-400 dark:text-stone-500 text-center flex items-center justify-center">
            Loading content...
          </div>
        }>
          <ErrorBoundaryWrapper fallback={
            <div className="p-4 my-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-900/30">
              <h3 className="text-xl font-space-mono text-red-700 dark:text-red-400 mb-2">Error Loading Content</h3>
              <p className="text-red-600 dark:text-red-300 font-space-mono text-sm">
                Failed to render blog content. Please try again later.
              </p>
            </div>
          }>
            <MDXContent />
          </ErrorBoundaryWrapper>
        </Suspense>
      </div>
    </BlogLayout>
  );
}

// Generate static paths for all blog posts
export async function generateStaticParams() {
  const posts = getAllPostMetadata();
  
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// Prevent 404 for unpredefined routes
export const dynamicParams = false;
