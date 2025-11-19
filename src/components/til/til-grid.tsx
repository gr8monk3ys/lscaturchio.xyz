"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Tag, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface TILItem {
  id: string
  title: string
  content: string
  date: string
  tags: string[]
  category: 'code' | 'ai' | 'design' | 'productivity' | 'other'
  url?: string
}

// This would eventually be loaded from a JSON file or CMS
const SAMPLE_TILS: TILItem[] = [
  {
    id: '1',
    title: 'Next.js 14 App Router Caching',
    content: 'The App Router has multiple caching layers: Router Cache (client), Full Route Cache (server), Request Memoization, and Data Cache. Understanding when each layer kicks in is crucial for performance.',
    date: '2025-01-18',
    tags: ['nextjs', 'performance'],
    category: 'code',
  },
  {
    id: '2',
    title: 'OpenAI Embedding Dimensions',
    content: 'text-embedding-ada-002 creates 1536-dimensional vectors. You can reduce dimensions using PCA for faster similarity search, but you lose some semantic precision. Trade-off is usually worth it above 10k documents.',
    date: '2025-01-17',
    tags: ['ai', 'embeddings', 'optimization'],
    category: 'ai',
  },
  {
    id: '3',
    title: 'Service Worker Caching Strategies',
    content: 'Network-first is great for dynamic content with offline fallback. Cache-first is better for static assets. Stale-while-revalidate gives instant response while updating cache in background - perfect for blogs.',
    date: '2025-01-16',
    tags: ['pwa', 'caching'],
    category: 'code',
  },
]

const CATEGORY_COLORS = {
  code: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
  ai: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300',
  design: 'bg-pink-100 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300',
  productivity: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300',
  other: 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300',
}

export function TILGrid() {
  const [items, setItems] = useState<TILItem[]>(SAMPLE_TILS)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = ['all', ...Array.from(new Set(items.map(item => item.category)))]

  const filteredItems = selectedCategory === 'all'
    ? items
    : items.filter(item => item.category === selectedCategory)

  return (
    <div>
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* TIL Cards */}
      <div className="space-y-6">
        {filteredItems.map((item, index) => (
          <motion.article
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary transition-colors"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`px-2 py-1 rounded text-xs font-medium ${CATEGORY_COLORS[item.category]}`}>
                  {item.category}
                </span>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <time dateTime={item.date}>
                    {new Date(item.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </time>
                </div>
              </div>
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>

            <h3 className="text-xl font-semibold mb-2 text-foreground">
              {item.title}
            </h3>

            <p className="text-muted-foreground mb-4 leading-relaxed">
              {item.content}
            </p>

            {item.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-muted-foreground hover:text-primary cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </motion.article>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No TILs found in this category.</p>
        </div>
      )}
    </div>
  )
}
