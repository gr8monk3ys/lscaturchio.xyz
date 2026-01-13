"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Calendar } from 'lucide-react'
import Image from 'next/image'

interface RelatedPost {
  title: string
  url: string
  description: string
  date: string
  image: string
}

interface RelatedPostsProps {
  currentTitle: string
  currentUrl: string
}

export function RelatedPosts({ currentTitle, currentUrl }: RelatedPostsProps) {
  const [posts, setPosts] = useState<RelatedPost[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const response = await fetch(
          `/api/related-posts?title=${encodeURIComponent(currentTitle)}&url=${encodeURIComponent(currentUrl)}&limit=3`
        )
        const data = await response.json()

        if (response.ok && data.related) {
          setPosts(data.related)
        }
      } catch (error) {
        console.error('Failed to fetch related posts:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRelated()
  }, [currentTitle, currentUrl])

  if (isLoading) {
    return (
      <div className="mt-12 pt-8">
        <h3 className="text-2xl font-bold mb-6">Related Posts</h3>
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse neu-flat rounded-2xl p-4">
              <div className="aspect-video bg-muted rounded-xl mb-3" />
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (posts.length === 0) {
    return null
  }

  return (
    <div className="mt-12 pt-8">
      <h3 className="text-2xl font-bold mb-6 text-foreground">Related Posts</h3>
      <div className="grid gap-6 md:grid-cols-3">
        {posts.map((post, index) => (
          <motion.div
            key={post.url}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              href={post.url}
              className="group block h-full rounded-2xl neu-card overflow-hidden"
            >
              <div className="aspect-video relative overflow-hidden bg-muted rounded-t-xl">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                  {post.title}
                </h4>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {post.description}
                </p>
                {post.date && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(post.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1 mt-3 text-sm text-primary">
                  <span>Read more</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
