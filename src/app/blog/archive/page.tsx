// Rule: TypeScript Usage - Use TypeScript for all code
"use client";

import { useState, useEffect } from "react";
import { useAllBlogs } from "@/lib/useBlogData";
import { Container } from "@/components/ui/container";
import { BreadcrumbNav } from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { BlogCardSkeleton } from "@/components/blog/BlogCardSkeleton";
import Link from "next/link";
import { formatDate } from "@/lib/formatDate";
import { FallbackImage } from "@/components/ui/fallback-image";

type SortOption = "date-desc" | "date-asc" | "title-asc" | "title-desc";

export default function BlogArchive(): JSX.Element {
  const { blogs, isLoading, isError } = useAllBlogs();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>("date-desc");
  const [allTags, setAllTags] = useState<string[]>([]);
  
  // Extract all unique tags from blogs
  useEffect(() => {
    if (blogs.length > 0) {
      const uniqueTags = Array.from(
        new Set(blogs.flatMap((blog) => blog.tags))
      ).sort();
      setAllTags(uniqueTags);
    }
  }, [blogs]);
  
  // Filter and sort blogs
  const filteredAndSortedBlogs = blogs
    .filter((blog) => 
      !selectedTag || blog.tags.includes(selectedTag)
    )
    .sort((a, b) => {
      switch (sortOption) {
        case "date-desc":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "date-asc":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "title-desc":
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });
  
  return (
    <Container className="mt-16 lg:mt-32">
      <div className="mx-auto max-w-2xl lg:max-w-none">
        <BreadcrumbNav customSegments={{ blog: "Blog", archive: "Archive" }} />
        
        <h1 className="mt-6 text-4xl font-space-mono font-bold tracking-tight text-stone-800 dark:text-stone-100 sm:text-5xl">
          Blog Archive
        </h1>
        
        <p className="mt-4 text-base font-space-mono text-stone-600 dark:text-stone-400">
          Browse all blog posts by date, title, or category.
        </p>
        
        <div className="mt-8 flex flex-wrap gap-4">
          <div className="flex-1">
            <label htmlFor="tag-filter" className="block text-sm font-space-mono font-medium text-stone-700 dark:text-stone-300 mb-2">
              Filter by Tag
            </label>
            <select
              id="tag-filter"
              value={selectedTag || ""}
              onChange={(e) => setSelectedTag(e.target.value || null)}
              className="block w-full rounded-md border-0 bg-stone-50 py-2 pl-3 pr-10 text-base font-space-mono text-stone-700 dark:text-stone-300 dark:bg-stone-800 shadow-[2px_2px_5px_rgba(0,0,0,0.05),-2px_-2px_5px_rgba(255,255,255,0.7)] dark:shadow-[2px_2px_5px_rgba(0,0,0,0.2),-1px_-1px_3px_rgba(255,255,255,0.05)] focus:shadow-[1px_1px_3px_rgba(0,0,0,0.1),-1px_-1px_3px_rgba(255,255,255,0.9)] dark:focus:shadow-[1px_1px_3px_rgba(0,0,0,0.3),-0.5px_-0.5px_2px_rgba(255,255,255,0.06)] focus:outline-none sm:text-sm transition-all"
            >
              <option value="" className="font-space-mono">All Tags</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag} className="font-space-mono">
                  {tag}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex-1">
            <label htmlFor="sort-option" className="block text-sm font-space-mono font-medium text-stone-700 dark:text-stone-300 mb-2">
              Sort By
            </label>
            <select
              id="sort-option"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="block w-full rounded-md border-0 bg-stone-50 py-2 pl-3 pr-10 text-base font-space-mono text-stone-700 dark:text-stone-300 dark:bg-stone-800 shadow-[2px_2px_5px_rgba(0,0,0,0.05),-2px_-2px_5px_rgba(255,255,255,0.7)] dark:shadow-[2px_2px_5px_rgba(0,0,0,0.2),-1px_-1px_3px_rgba(255,255,255,0.05)] focus:shadow-[1px_1px_3px_rgba(0,0,0,0.1),-1px_-1px_3px_rgba(255,255,255,0.9)] dark:focus:shadow-[1px_1px_3px_rgba(0,0,0,0.3),-0.5px_-0.5px_2px_rgba(255,255,255,0.06)] focus:outline-none sm:text-sm transition-all"
            >
              <option value="date-desc" className="font-space-mono">Newest First</option>
              <option value="date-asc" className="font-space-mono">Oldest First</option>
              <option value="title-asc" className="font-space-mono">Title (A-Z)</option>
              <option value="title-desc" className="font-space-mono">Title (Z-A)</option>
            </select>
          </div>
        </div>
        
        {isLoading && (
          <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {Array(6).fill(0).map((_, index) => (
              <BlogCardSkeleton key={index} />
            ))}
          </div>
        )}
        
        {isError && (
          <div className="mt-10 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
            <div className="flex">
              <div className="text-sm text-red-700 dark:text-red-400">
                <p>Failed to load blog posts. Please try again later.</p>
              </div>
            </div>
          </div>
        )}
        
        {!isLoading && !isError && filteredAndSortedBlogs.length === 0 && (
          <div className="mt-10 rounded-md bg-stone-50 p-8 text-center dark:bg-stone-800/50">
            <p className="text-stone-600 dark:text-stone-400">
              No blog posts found with the selected filters.
            </p>
          </div>
        )}
        
        {!isLoading && !isError && filteredAndSortedBlogs.length > 0 && (
          <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedBlogs.map((blog) => (
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
                      <p className="mt-3 text-base text-stone-500 dark:text-stone-400 line-clamp-3">
                        {blog.description}
                      </p>
                    </Link>
                  </div>
                  
                  <div className="mt-6 flex flex-wrap gap-2">
                    {blog.tags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setSelectedTag(tag)}
                        className="inline-flex items-center rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-800 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
                      >
                        {tag}
                      </button>
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
    </Container>
  );
}
