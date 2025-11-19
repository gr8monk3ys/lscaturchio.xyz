"use client"

import { useState } from 'react'
import { Copy, Check, Code2, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Endpoint {
  method: string
  path: string
  description: string
  parameters?: { name: string; type: string; description: string; required?: boolean }[]
  response: string
  example: string
}

const ENDPOINTS: Endpoint[] = [
  {
    method: 'GET',
    path: '/api/v1/blogs',
    description: 'Get all blog posts with pagination and filtering',
    parameters: [
      { name: 'limit', type: 'number', description: 'Number of posts to return (default: 10)' },
      { name: 'offset', type: 'number', description: 'Number of posts to skip (default: 0)' },
      { name: 'tag', type: 'string', description: 'Filter by tag' },
    ],
    response: `{
  "data": [
    {
      "title": "Building RAG Systems",
      "description": "A comprehensive guide...",
      "date": "2024-01-15",
      "slug": "building-rag-systems",
      "tags": ["ai", "tutorial"],
      "image": "/images/blog/rag.webp",
      "url": "https://lscaturchio.xyz/blog/building-rag-systems"
    }
  ],
  "meta": {
    "total": 14,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}`,
    example: 'curl https://lscaturchio.xyz/api/v1/blogs?limit=5&tag=ai',
  },
  {
    method: 'GET',
    path: '/api/v1/blogs/:slug',
    description: 'Get a single blog post by slug',
    parameters: [
      { name: 'slug', type: 'string', description: 'Blog post slug', required: true },
    ],
    response: `{
  "data": {
    "title": "Building RAG Systems",
    "description": "A comprehensive guide...",
    "date": "2024-01-15",
    "slug": "building-rag-systems",
    "tags": ["ai", "tutorial"],
    "image": "/images/blog/rag.webp",
    "url": "https://lscaturchio.xyz/blog/building-rag-systems"
  }
}`,
    example: 'curl https://lscaturchio.xyz/api/v1/blogs/building-rag-systems',
  },
  {
    method: 'GET',
    path: '/api/v1/stats',
    description: 'Get site statistics including post count and popular tags',
    response: `{
  "data": {
    "totalPosts": 14,
    "totalTags": 23,
    "popularTags": [
      { "tag": "ai", "count": 5 },
      { "tag": "tutorial", "count": 4 }
    ],
    "latestPost": {
      "title": "Latest Post",
      "date": "2024-01-15",
      "slug": "latest-post"
    }
  }
}`,
    example: 'curl https://lscaturchio.xyz/api/v1/stats',
  },
  {
    method: 'GET',
    path: '/api/search',
    description: 'Semantic search across blog posts',
    parameters: [
      { name: 'q', type: 'string', description: 'Search query', required: true },
      { name: 'limit', type: 'number', description: 'Number of results (default: 10)' },
    ],
    response: `{
  "query": "machine learning",
  "results": [
    {
      "title": "AI Ethics",
      "url": "/blog/ai-ethics",
      "description": "...",
      "similarity": 0.87
    }
  ],
  "count": 5
}`,
    example: 'curl "https://lscaturchio.xyz/api/search?q=machine%20learning&limit=5"',
  },
]

export function ApiDocumentation() {
  const [copiedExample, setCopiedExample] = useState<string | null>(null)
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null)

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedExample(id)
    setTimeout(() => setCopiedExample(null), 2000)
  }

  return (
    <div className="space-y-8">
      {/* Overview */}
      <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-800 bg-muted/50">
        <h2 className="text-lg font-semibold mb-3">Base URL</h2>
        <code className="text-sm bg-black dark:bg-white/10 text-white dark:text-gray-200 px-3 py-1.5 rounded">
          https://lscaturchio.xyz
        </code>

        <h3 className="text-lg font-semibold mt-6 mb-3">Rate Limiting</h3>
        <p className="text-sm text-muted-foreground">
          No rate limiting currently. Please be respectful and don&apos;t abuse the API.
        </p>

        <h3 className="text-lg font-semibold mt-6 mb-3">Response Format</h3>
        <p className="text-sm text-muted-foreground">
          All responses are JSON. Successful responses return 200 status code with data.
          Errors return appropriate status codes (404, 500) with error message.
        </p>
      </div>

      {/* Endpoints */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Endpoints</h2>

        {ENDPOINTS.map((endpoint) => {
          const id = `${endpoint.method}-${endpoint.path}`
          const isExpanded = expandedEndpoint === id

          return (
            <div
              key={id}
              className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden"
            >
              <button
                onClick={() => setExpandedEndpoint(isExpanded ? null : id)}
                className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    endpoint.method === 'GET'
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                      : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  }`}>
                    {endpoint.method}
                  </span>
                  <code className="text-sm font-mono">{endpoint.path}</code>
                </div>
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-200 dark:border-gray-800"
                  >
                    <div className="p-4 space-y-4">
                      <p className="text-sm text-muted-foreground">{endpoint.description}</p>

                      {endpoint.parameters && endpoint.parameters.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Parameters</h4>
                          <div className="space-y-2">
                            {endpoint.parameters.map((param) => (
                              <div key={param.name} className="text-sm">
                                <code className="text-primary">{param.name}</code>
                                <span className="text-muted-foreground mx-2">•</span>
                                <span className="text-muted-foreground">{param.type}</span>
                                {param.required && (
                                  <span className="ml-2 text-xs text-red-500">required</span>
                                )}
                                <p className="text-muted-foreground ml-4 mt-1">{param.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="text-sm font-semibold mb-2">Example Response</h4>
                        <pre className="p-4 rounded-md bg-gray-950 dark:bg-gray-900 text-gray-100 text-xs overflow-x-auto">
                          <code>{endpoint.response}</code>
                        </pre>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold">Example Request</h4>
                          <button
                            onClick={() => copyToClipboard(endpoint.example, id)}
                            className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-muted hover:bg-muted/80"
                          >
                            {copiedExample === id ? (
                              <>
                                <Check className="h-3 w-3" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="p-4 rounded-md bg-gray-950 dark:bg-gray-900 text-gray-100 text-xs overflow-x-auto">
                          <code>{endpoint.example}</code>
                        </pre>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {/* SDK Examples */}
      <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <Code2 className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Usage Examples</h3>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold mb-2">JavaScript / TypeScript</h4>
            <pre className="p-4 rounded-md bg-gray-950 dark:bg-gray-900 text-gray-100 text-xs overflow-x-auto">
              <code>{`const response = await fetch('https://lscaturchio.xyz/api/v1/blogs?limit=5')
const { data, meta } = await response.json()

console.log(\`Found \${meta.total} blog posts\`)
data.forEach(blog => console.log(blog.title))`}</code>
            </pre>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-2">Python</h4>
            <pre className="p-4 rounded-md bg-gray-950 dark:bg-gray-900 text-gray-100 text-xs overflow-x-auto">
              <code>{`import requests

response = requests.get('https://lscaturchio.xyz/api/v1/blogs',
                       params={'limit': 5})
data = response.json()

print(f"Found {data['meta']['total']} blog posts")
for blog in data['data']:
    print(blog['title'])`}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
