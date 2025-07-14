// Rule: TypeScript Usage - Use TypeScript for all code
"use client";

import { useBlogsByTag } from "@/lib/useBlogData";
import { Container } from "@/components/ui/container";
import { BreadcrumbNav } from "@/components/ui/breadcrumb";
import { BlogCardSkeleton } from "@/components/blog/BlogCardSkeleton";
import Link from "next/link";
import { formatDate } from "@/lib/formatDate";
import { FallbackImage } from "@/components/ui/fallback-image";
import { TagCloud } from "@/components/blog/TagCloud";

export default function TagPage({ params }: { params: { tag: string } }): JSX.Element {
  const tag = decodeURIComponent(params.tag);
  const { blogs, isLoading, isError } = useBlogsByTag(tag);
  
  return (
    <Container className="mt-16 lg:mt-32">
      <div className="mx-auto max-w-2xl lg:max-w-5xl">
        <BreadcrumbNav 
          customSegments={{ 
            blog: "Blog",
            tag: "Tags",
            [tag]: tag.charAt(0).toUpperCase() + tag.slice(1)
          }} 
        />
        
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-stone-800 dark:text-stone-100 sm:text-5xl">
          Posts tagged with &ldquo;{tag}&rdquo;
        </h1>
        
        <div className="mt-8 lg:grid lg:grid-cols-4 lg:gap-8">
          <div className="lg:col-span-3">
            {isLoading && (
              <div className="grid gap-8 md:grid-cols-2">
                {Array(4).fill(0).map((_, index) => (
                  <BlogCardSkeleton key={index} />
                ))}
              </div>
            )}
            
            {isError && (
              <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                <div className="flex">
                  <div className="text-sm text-red-700 dark:text-red-400">
                    <p>Failed to load blog posts. Please try again later.</p>
                  </div>
                </div>
              </div>
            )}
            
            {!isLoading && !isError && blogs.length === 0 && (
              <div className="rounded-md bg-stone-50 p-8 text-center dark:bg-stone-800/50">
                <p className="text-stone-600 dark:text-stone-400">
                  No blog posts found with the tag &ldquo;{tag}&rdquo;.
                </p>
                <Link 
                  href="/blog" 
                  className="mt-4 inline-block text-stone-600 dark:text-stone-400 underline underline-offset-2 hover:text-stone-900 dark:hover:text-stone-200"
                >
                  Browse all blog posts
                </Link>
              </div>
            )}
            
            {!isLoading && !isError && blogs.length > 0 && (
              <div className="grid gap-8 md:grid-cols-2">
                {blogs.map((blog) => (
                  <article
                    key={blog.slug}
                    className="group relative flex flex-col overflow-hidden rounded-lg border border-stone-200 bg-white transition-all hover:shadow-md dark:border-stone-800 dark:bg-stone-950"
                  >
                    <Link href={`/blog/${blog.slug}`} className="block overflow-hidden">
                      <div className="aspect-[16/9] w-full bg-stone-100 dark:bg-stone-800">
                        <FallbackImage
                          src={blog.image}
                          alt={blog.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          width={400}
                          height={225}
                        />
                      </div>
                    </Link>
                    
                    <div className="flex flex-1 flex-col justify-between p-6">
                      <div className="flex-1">
                        <p className="text-sm text-stone-500 dark:text-stone-400">
                          {formatDate(blog.date)}
                        </p>
                        <Link href={`/blog/${blog.slug}`} className="mt-2 block">
                          <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-100">
                            {blog.title}
                          </h3>
                          <p className="mt-3 text-base text-stone-500 dark:text-stone-400 line-clamp-2">
                            {blog.description}
                          </p>
                        </Link>
                      </div>
                      
                      <div className="mt-6 flex flex-wrap gap-2">
                        {blog.tags.map((blogTag) => (
                          <Link
                            key={blogTag}
                            href={`/blog/tag/${encodeURIComponent(blogTag.toLowerCase())}`}
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                              blogTag.toLowerCase() === tag.toLowerCase()
                                ? 'bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-900'
                                : 'bg-stone-100 text-stone-800 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700'
                            }`}
                          >
                            {blogTag}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
            
            <div className="mt-16 text-center">
              <Link 
                href="/blog" 
                className="text-stone-600 dark:text-stone-400 underline underline-offset-2 hover:text-stone-900 dark:hover:text-stone-200"
              >
                ← Back to Blog
              </Link>
            </div>
          </div>
          
          <div className="mt-12 lg:mt-0">
            <div className="sticky top-8">
              <TagCloud className="mb-6" />
              
              <div className="rounded-lg bg-stone-50 p-4 dark:bg-stone-900/50">
                <h2 className="font-medium text-stone-800 dark:text-stone-200 mb-3">Discover More</h2>
                <ul className="space-y-2">
                  <li>
                    <Link 
                      href="/blog/archive" 
                      className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                    >
                      Browse All Posts
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/blog" 
                      className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                    >
                      Recent Posts
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
