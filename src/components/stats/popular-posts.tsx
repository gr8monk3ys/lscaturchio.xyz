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
      // Placeholder data - would fetch from analytics
      await new Promise(resolve => setTimeout(resolve, 800))

      setPosts([
        { title: 'Building RAG Systems with OpenAI', url: '/blog/building-rag-systems', views: 2341 },
        { title: 'AI Ethics in Modern Development', url: '/blog/ai-ethics', views: 1876 },
        { title: 'The Art of Technology Integration', url: '/blog/art-technology', views: 1543 },
        { title: 'Understanding the Metaverse', url: '/blog/metaverse', views: 1234 },
        { title: 'Investing in Privacy', url: '/blog/investing-in-monero', views: 987 },
      ])
      setIsLoading(false)
    }

    fetchPopular()
  }, [])

  return (
    <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="text-xl font-semibold">Popular Posts</h3>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="animate-pulse flex items-center justify-between">
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
