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
  {
    id: '5',
    title: 'Cosine Similarity for Vectors',
    description: 'Calculate similarity between embedding vectors for semantic search.',
    code: `export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) throw new Error('Vectors must be same length')

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

// Usage: similarity > 0.8 usually means semantically similar`,
    language: 'typescript',
    tags: ['ai', 'embeddings', 'math'],
    category: 'AI/ML',
  },
  {
    id: '6',
    title: 'useLocalStorage Hook',
    description: 'Persist state to localStorage with SSR safety and type inference.',
    code: `import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) setStoredValue(JSON.parse(item))
    } catch (error) {
      console.error(error)
    }
  }, [key])

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(error)
    }
  }

  return [storedValue, setValue] as const
}`,
    language: 'typescript',
    tags: ['react', 'hooks', 'storage'],
    category: 'React',
  },
  {
    id: '7',
    title: 'Streaming Chat Response',
    description: 'Handle streaming responses from OpenAI chat API with async iterators.',
    code: `async function* streamChat(messages: Message[]) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages,
    stream: true,
  })

  for await (const chunk of response) {
    const content = chunk.choices[0]?.delta?.content
    if (content) yield content
  }
}

// Usage in React:
const [text, setText] = useState('')
for await (const chunk of streamChat(messages)) {
  setText(prev => prev + chunk)
}`,
    language: 'typescript',
    tags: ['openai', 'streaming', 'async'],
    category: 'AI/ML',
  },
  {
    id: '8',
    title: 'Retry with Exponential Backoff',
    description: 'Retry failed async operations with exponential backoff and jitter.',
    code: `async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i) + Math.random() * 1000
        await new Promise(r => setTimeout(r, delay))
      }
    }
  }

  throw lastError!
}

// Usage: await retry(() => fetch(url), 3, 1000)`,
    language: 'typescript',
    tags: ['async', 'error-handling', 'utilities'],
    category: 'JavaScript',
  },
  {
    id: '9',
    title: 'Zod Schema Validation',
    description: 'Type-safe runtime validation with Zod for API responses.',
    code: `import { z } from 'zod'

const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(['admin', 'user']),
  createdAt: z.string().datetime(),
})

type User = z.infer<typeof UserSchema>

// Validate API response
const response = await fetch('/api/user')
const data = await response.json()
const user = UserSchema.parse(data) // Throws if invalid

// Safe parse (no throw)
const result = UserSchema.safeParse(data)
if (result.success) {
  console.log(result.data)
}`,
    language: 'typescript',
    tags: ['zod', 'validation', 'typescript'],
    category: 'JavaScript',
  },
  {
    id: '10',
    title: 'Python Dataclass with Validation',
    description: 'Use Pydantic for type-safe data models with automatic validation.',
    code: `from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional

class User(BaseModel):
    id: str
    email: str
    name: str = Field(..., min_length=1)
    role: str = "user"
    created_at: datetime = Field(default_factory=datetime.now)

    @validator('email')
    def email_must_be_valid(cls, v):
        if '@' not in v:
            raise ValueError('invalid email')
        return v.lower()

# Usage
user = User(id="123", email="Test@Example.com", name="John")
print(user.email)  # test@example.com
print(user.model_dump_json())`,
    language: 'python',
    tags: ['pydantic', 'validation', 'python'],
    category: 'Python',
  },
  {
    id: '11',
    title: 'Git Aliases for Speed',
    description: 'Essential git aliases to speed up your workflow.',
    code: `# Add to ~/.gitconfig
[alias]
    co = checkout
    br = branch
    ci = commit
    st = status
    lg = log --oneline --graph --decorate
    last = log -1 HEAD --stat
    undo = reset HEAD~1 --mixed
    amend = commit --amend --no-edit
    pushf = push --force-with-lease
    sync = !git fetch origin && git rebase origin/main
    cleanup = !git branch --merged | grep -v main | xargs git branch -d

# Usage: git lg, git undo, git amend`,
    language: 'bash',
    tags: ['git', 'productivity', 'cli'],
    category: 'CLI',
  },
  {
    id: '12',
    title: 'fzf Fuzzy Finder',
    description: 'Quick file and command navigation with fuzzy finding.',
    code: `# Find and open file in editor
vim $(fzf)

# Search git commits
git log --oneline | fzf | cut -d' ' -f1 | xargs git show

# Kill process interactively
kill -9 $(ps aux | fzf | awk '{print $2}')

# cd to any directory
cd $(find ~ -type d | fzf)

# Add to .bashrc for Ctrl+R replacement
export FZF_DEFAULT_OPTS='--height 40% --reverse'

# Better file preview
fzf --preview 'bat --color=always {}'`,
    language: 'bash',
    tags: ['fzf', 'productivity', 'cli'],
    category: 'CLI',
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
