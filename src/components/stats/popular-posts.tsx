"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { TrendingUp } from 'lucide-react'

interface PopularPost {
  title: string
  url: string
  views: number
}

export function PopularPosts() {
  const [posts, setPosts] = useState<PopularPost[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        // Fetch real views data from our views API
        const response = await fetch('/api/views', { method: 'OPTIONS' });
        if (response.ok) {
          const data = await response.json();

          // Sort by views and take top 5
          const sortedPosts = data.views
            .sort((a: { views: number }, b: { views: number }) => b.views - a.views)
            .slice(0, 5)
            .map((post: { slug: string; title: string; views: number }) => ({
              title: post.title, // Use real title from API
              url: `/blog/${post.slug}`,
              views: post.views,
            }));

          setPosts(sortedPosts);
        }
      } catch (error) {
        console.error('Failed to fetch popular posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPopular();
  }, []);

  return (
    <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="text-xl font-semibold">Popular Posts</h3>
      </div>

      {isLoading ? (
        <div className="space-y-4" aria-busy="true" aria-label="Loading popular posts">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="animate-pulse flex items-center justify-between" role="presentation">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post, index) => (
            <Link
              key={post.url}
              href={post.url}
              className="flex items-center justify-between group hover:translate-x-1 transition-transform"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-sm font-medium text-muted-foreground w-6">
                  {index + 1}
                </span>
                <p className="text-sm text-foreground group-hover:text-primary truncate">
                  {post.title}
                </p>
              </div>
              <span className="text-sm text-muted-foreground ml-4">
                {post.views.toLocaleString()} views
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
