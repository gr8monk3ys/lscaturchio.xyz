"use client"

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Loader2, FileText, Calendar, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface SearchResult {
  title: string
  url: string
  description: string
  date: string
  similarity: number
  snippets: string[]
}

interface SearchDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function SearchDialog({ isOpen, onClose }: SearchDialogProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=8`)
      const data = await response.json()

      if (response.ok) {
        setResults(data.results || [])
      } else {
        setError(data.error || 'Search failed')
        setResults([])
      }
    } catch {
      setError('Network error. Please try again.')
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        performSearch(query)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, performSearch])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-start justify-center pt-20 px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="neu-flat rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search blog posts..."
                autoFocus
                className="w-full pl-12 pr-12 py-4 text-lg neu-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {isLoading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />
              )}
              <button
                onClick={onClose}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 neu-button rounded-lg transition-all hover:text-primary"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="overflow-y-auto max-h-[calc(80vh-80px)]">
            {error && (
              <div className="p-4 text-center text-sm text-red-500">
                {error}
              </div>
            )}

            {!error && query && !isLoading && results.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No results found for &ldquo;{query}&rdquo;</p>
              </div>
            )}

            {results.length > 0 && (
              <div className="space-y-3 p-4 pt-0">
                {results.map((result, index) => (
                  <Link
                    key={index}
                    href={result.url}
                    onClick={onClose}
                    className="block p-4 rounded-xl neu-card group"
                  >
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {result.title}
                        </h3>
                        {result.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {result.description}
                          </p>
                        )}
                        {result.snippets.length > 0 && (
                          <p className="text-xs text-muted-foreground/70 mt-2 line-clamp-2 italic">
                            &ldquo;{result.snippets[0]}&rdquo;
                          </p>
                        )}
                        {result.date && (
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(result.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                          </div>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {results.length > 0 && (
            <div className="p-4 text-center">
              <p className="text-xs text-muted-foreground">
                Showing {results.length} result{results.length !== 1 ? 's' : ''} • Powered by semantic search
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
