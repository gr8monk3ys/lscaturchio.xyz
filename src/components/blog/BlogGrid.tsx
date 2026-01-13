"use client";

import React, { useState, useEffect } from "react";
import { BlogCard } from "@/components/blog/BlogCard";
import { AdBanner } from "@/components/ads/AdBanner";
import { useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import Link from "next/link";

interface Blog {
  slug: string;
  title: string;
  description: string;
  date: string;
  image: string;
  tags: string[];
}

interface BlogGridProps {
  blogs: Blog[];
}

export function BlogGrid({ blogs }: BlogGridProps) {
  const searchParams = useSearchParams();
  const tagFilter = searchParams?.get("tag");
  const [filteredBlogs, setFilteredBlogs] = useState(blogs);

  useEffect(() => {
    if (tagFilter) {
      setFilteredBlogs(
        blogs.filter((blog) =>
          blog.tags.some(
            (tag) => tag.toLowerCase() === tagFilter.toLowerCase()
          )
        )
      );
    } else {
      setFilteredBlogs(blogs);
    }
  }, [tagFilter, blogs]);

  return (
    <>
      {tagFilter && (
        <div className="mb-6 p-5 rounded-2xl neu-flat flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium">Filtered by tag:</span>
            <span className="px-4 py-1.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium capitalize shadow-sm">
              {tagFilter}
            </span>
            <span className="text-sm text-muted-foreground">
              ({filteredBlogs.length} {filteredBlogs.length === 1 ? "post" : "posts"})
            </span>
          </div>
          <Link
            href="/blog"
            className="flex items-center gap-2 px-4 py-2 rounded-xl neu-button text-sm text-muted-foreground hover:text-foreground transition-all"
          >
            <X className="h-4 w-4" />
            Clear filter
          </Link>
        </div>
      )}

      {filteredBlogs.length === 0 && (
        <div className="text-center py-16 neu-card rounded-2xl">
          <p className="text-lg text-muted-foreground">
            No blog posts found with the tag &quot;{tagFilter}&quot;.
          </p>
          <Link
            href="/blog"
            className="mt-4 inline-block px-6 py-2 rounded-xl neu-button text-primary hover:text-primary/80 transition-all"
          >
            View all posts
          </Link>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredBlogs.map((blog, index) => (
          <React.Fragment key={blog.slug}>
            <BlogCard {...blog} />
            {/* Insert ad after every 6th blog post */}
            {index > 0 && (index + 1) % 6 === 0 && (
              <div key={`ad-${index}`} className="col-span-full my-6">
                <AdBanner slot="6789012345" format="horizontal" responsive={true} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </>
  );
}
