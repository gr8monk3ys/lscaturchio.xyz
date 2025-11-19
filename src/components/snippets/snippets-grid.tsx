"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Copy, Check, Tag, Code2 } from 'lucide-react'
import { CodeBlock } from './code-block'

interface Snippet {
  id: string
  title: string
  description: string
  code: string
  language: string
  tags: string[]
  category: string
}

const SAMPLE_SNIPPETS: Snippet[] = [
  {
    id: '1',
    title: 'Debounce Hook',
    description: 'React hook for debouncing values to optimize performance on rapid changes.',
    code: `import { useEffect, useState } from 'react'

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}`,
    language: 'typescript',
    tags: ['react', 'hooks', 'performance'],
    category: 'React',
  },
  {
    id: '2',
    title: 'Fetch with Timeout',
    description: 'Wrapper for fetch API with configurable timeout to prevent hanging requests.',
    code: `export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = 8000
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}`,
    language: 'typescript',
    tags: ['fetch', 'async', 'utilities'],
    category: 'JavaScript',
  },
  {
    id: '3',
    title: 'Generate Embeddings Batch',
    description: 'Efficiently generate OpenAI embeddings in batches to avoid rate limits.',
    code: `import OpenAI from 'openai'

const openai = new OpenAI()

export async function generateEmbeddingsBatch(
  texts: string[],
  batchSize: number = 100
): Promise<number[][]> {
  const embeddings: number[][] = []

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize)
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: batch,
    })
    embeddings.push(...response.data.map(d => d.embedding))

    // Delay to avoid rate limits
    if (i + batchSize < texts.length) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  return embeddings
}`,
    language: 'typescript',
    tags: ['openai', 'embeddings', 'ai'],
    category: 'AI/ML',
  },
  {
    id: '4',
    title: 'Tailwind Container Query',
    description: 'Use CSS container queries with Tailwind for component-based responsive design.',
    code: `/* Add to tailwind.config.ts */
module.exports = {
  plugins: [
    require('@tailwindcss/container-queries'),
  ],
}

/* Usage in components */
<div className="@container">
  <div className="@sm:grid-cols-2 @lg:grid-cols-3 grid">
    {/* Content */}
  </div>
</div>`,
    language: 'typescript',
    tags: ['tailwind', 'css', 'responsive'],
    category: 'CSS',
  },
]

export function SnippetsGrid() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const categories = ['all', ...Array.from(new Set(SAMPLE_SNIPPETS.map(s => s.category)))]

  const filteredSnippets = SAMPLE_SNIPPETS.filter(snippet => {
    const matchesSearch =
      snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = selectedCategory === 'all' || snippet.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const copyToClipboard = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div>
      {/* Search and Filter */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search snippets..."
            className="w-full pl-11 pr-4 py-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex flex-wrap gap-2">
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
      </div>

      {/* Snippets */}
      <div className="space-y-6">
        {filteredSnippets.map((snippet, index) => (
          <motion.article
            key={snippet.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Code2 className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-semibold text-foreground">
                      {snippet.title}
                    </h3>
                  </div>
                  <p className="text-muted-foreground">
                    {snippet.description}
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(snippet.code, snippet.id)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted hover:bg-muted/80 text-sm font-medium transition-colors"
                >
                  {copiedId === snippet.id ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap mb-4">
                <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                {snippet.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-muted-foreground hover:text-primary cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <CodeBlock code={snippet.code} language={snippet.language} />
            </div>
          </motion.article>
        ))}
      </div>

      {filteredSnippets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No snippets found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}
