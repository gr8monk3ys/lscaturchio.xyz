"use client"

import { motion } from 'framer-motion'
import { Plus, Edit, Bug, Sparkles } from 'lucide-react'

interface ChangeItem {
  type: 'added' | 'changed' | 'fixed' | 'highlight'
  text: string
}

interface ChangelogEntry {
  version: string
  date: string
  changes: ChangeItem[]
}

const CHANGELOG: ChangelogEntry[] = [
  {
    version: '2.0.0',
    date: '2025-01-18',
    changes: [
      { type: 'highlight', text: 'Major website redesign and feature expansion' },
      { type: 'added', text: 'Dark/light mode toggle with system preference detection' },
      { type: 'added', text: 'Newsletter subscription system with Supabase backend' },
      { type: 'added', text: 'Semantic search with CMD+K shortcut (OpenAI embeddings)' },
      { type: 'added', text: 'PWA support with offline functionality' },
      { type: 'added', text: 'Reading time estimation and scroll progress bar' },
      { type: 'added', text: 'AI-powered related posts recommendations' },
      { type: 'added', text: 'TIL (Today I Learned) digital garden section' },
      { type: 'added', text: 'Code snippets library with search and copy functionality' },
      { type: 'added', text: 'Giscus comments integration (GitHub Discussions)' },
      { type: 'added', text: 'Public analytics dashboard with real-time stats' },
      { type: 'added', text: 'GitHub contributions graph visualization' },
      { type: 'added', text: 'Public API with comprehensive documentation' },
      { type: 'changed', text: 'Optimized images to WebP format (89.9% size reduction)' },
      { type: 'changed', text: 'Improved navigation structure' },
      { type: 'changed', text: 'Enhanced mobile responsiveness' },
      { type: 'fixed', text: 'TypeScript strict mode compliance' },
      { type: 'fixed', text: 'Accessibility improvements' },
    ],
  },
  {
    version: '1.0.0',
    date: '2024-12-01',
    changes: [
      { type: 'highlight', text: 'Initial website launch' },
      { type: 'added', text: 'Blog system with MDX support' },
      { type: 'added', text: 'Portfolio projects showcase' },
      { type: 'added', text: 'AI chat powered by OpenAI GPT-4o' },
      { type: 'added', text: 'RSS feed generation' },
      { type: 'added', text: 'Automated sitemap generation' },
      { type: 'added', text: 'Vercel Analytics integration' },
    ],
  },
  {
    version: '0.1.0',
    date: '2024-11-01',
    changes: [
      { type: 'added', text: 'Project initialization' },
      { type: 'added', text: 'Basic Next.js setup' },
      { type: 'added', text: 'Design system foundation' },
    ],
  },
]

const CHANGE_ICONS = {
  added: { icon: Plus, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/20' },
  changed: { icon: Edit, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/20' },
  fixed: { icon: Bug, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/20' },
  highlight: { icon: Sparkles, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/20' },
}

export function ChangelogTimeline() {
  return (
    <div className="space-y-12">
      {CHANGELOG.map((entry, index) => (
        <motion.div
          key={entry.version}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative"
        >
          {/* Timeline line */}
          {index < CHANGELOG.length - 1 && (
            <div className="absolute left-[15px] top-12 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-800" />
          )}

          {/* Version header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold z-10">
              {entry.version.split('.')[0]}
            </div>
            <div>
              <h3 className="text-2xl font-bold">Version {entry.version}</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(entry.date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Changes list */}
          <div className="ml-12 space-y-3">
            {entry.changes.map((change, changeIndex) => {
              const config = CHANGE_ICONS[change.type]
              const Icon = config.icon

              return (
                <div
                  key={changeIndex}
                  className={`flex items-start gap-3 p-3 rounded-lg ${
                    change.type === 'highlight' ? 'border-2 border-primary' : ''
                  }`}
                >
                  <div className={`p-1.5 rounded ${config.bg} flex-shrink-0`}>
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>
                  <p className={`text-sm ${change.type === 'highlight' ? 'font-semibold' : ''}`}>
                    {change.text}
                  </p>
                </div>
              )
            })}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
