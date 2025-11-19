"use client"

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { SearchDialog } from './search-dialog'
import { motion } from 'framer-motion'

export function SearchButton() {
  const [isOpen, setIsOpen] = useState(false)

  // Listen for CMD+K / CTRL+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors text-sm"
        aria-label="Search"
      >
        <Search className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground hidden sm:inline">Search...</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-mono bg-muted rounded">
          <span>⌘</span>K
        </kbd>
      </motion.button>

      <SearchDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
