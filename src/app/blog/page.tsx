// Rule: TypeScript Usage - Use TypeScript for all code
"use client";

import React, { useCallback } from "react";
import { Container } from "@/components/Container";
import { BlogCard } from "@/components/blog/BlogCard";
import { BlogCardSkeleton } from "@/components/blog/BlogCardSkeleton";
import { DynamicTagCloud } from "@/components/blog/DynamicTagCloud";
import { useAllBlogs } from "@/lib/useBlogData";
import Link from "next/link";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

interface Blog {
  slug: string;
  title: string;
  description: string;
  date: string;
  image: string;
  tags: string[];
}

// Note: Metadata must be in a separate file for client components
// See: app/blog/metadata.tsx

export default function Blog(): JSX.Element {
  const router = useRouter();
  const { blogs, isLoading, isError, mutate } = useAllBlogs();
  
  const handleRetry = useCallback(() => {
    // Refresh the data
    mutate();
  }, [mutate]);

  return (
    <Container className="mt-16 lg:mt-32">
      <div className="mx-auto max-w-2xl lg:max-w-5xl">
        <div className="mb-12">
          <h1 className="text-4xl font-space-mono font-bold tracking-tight text-stone-800 dark:text-stone-100 sm:text-5xl">
            Blog
          </h1>
          <p className="mt-4 text-base font-space-mono text-stone-600 dark:text-stone-400">
            Thoughts on software development, technology, and life.
          </p>
          
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link 
              href="/blog/archive" 
              className="inline-flex items-center rounded-lg bg-stone-50 dark:bg-stone-700 px-4 py-2 text-sm font-space-mono font-medium text-stone-700 dark:text-stone-300 shadow-[2px_2px_3px_rgba(0,0,0,0.05),-2px_-2px_3px_rgba(255,255,255,0.6)] dark:shadow-[2px_2px_3px_rgba(0,0,0,0.2),-1px_-1px_2px_rgba(255,255,255,0.03)] hover:shadow-[1px_1px_2px_rgba(0,0,0,0.05),-1px_-1px_2px_rgba(255,255,255,0.7)] dark:hover:shadow-[1px_1px_2px_rgba(0,0,0,0.2),-0.5px_-0.5px_1px_rgba(255,255,255,0.04)] hover:translate-y-[-1px] transition-all border-0"
            >
              <Search className="mr-2 h-4 w-4" />
              Browse Archive
            </Link>
          </div>
        </div>
        
        <div className="lg:grid lg:grid-cols-4 lg:gap-x-8">
          <div className="lg:col-span-3">
            
            {isLoading && (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2">
                {[...Array(4)].map((_, index) => (
                  <BlogCardSkeleton key={index} />
                ))}
              </div>
            )}
            {!isLoading && (
              <>
                {blogs && blogs.length > 0 ? (
                  <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2">
                    {blogs.map((blog, index) => (
                      <React.Fragment key={blog.slug}>
                        <BlogCard {...blog} />
                      </React.Fragment>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-md bg-stone-50 p-4 dark:bg-stone-800 shadow-[2px_2px_5px_rgba(0,0,0,0.05),-2px_-2px_5px_rgba(255,255,255,0.7)] dark:shadow-[2px_2px_5px_rgba(0,0,0,0.2),-1px_-1px_3px_rgba(255,255,255,0.05)]">
                    <p className="text-stone-600 dark:text-stone-400 font-space-mono">No blog posts found. Check the console for debugging information.</p>
                  </div>
                )}
              </>
            )}
          </div>
          
          <div className="mt-12 lg:mt-0">
            <div className="sticky top-8 space-y-6">
              <DynamicTagCloud limit={15} />
              
              <div className="rounded-lg bg-stone-50 dark:bg-stone-800 p-4 shadow-[1px_1px_2px_rgba(0,0,0,0.05),-1px_-1px_2px_rgba(255,255,255,0.6)] dark:shadow-[1px_1px_2px_rgba(0,0,0,0.2),-0.5px_-0.5px_1px_rgba(255,255,255,0.03)]">
                <ul className="space-y-2">
                  <li>
                    <Link 
                      href="/blog/archive" 
                      className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-all hover:pl-1 hover:underline hover:underline-offset-4"
                    >
                      Browse All Posts
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/api/rss" 
                      target="_blank"
                      className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-all hover:pl-1 hover:underline hover:underline-offset-4"
                    >
                      RSS Feed
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
