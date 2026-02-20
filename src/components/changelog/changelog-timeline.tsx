"use client"

import { motion } from '@/lib/motion'
import { Plus, Edit, Bug, Sparkles } from 'lucide-react'
import { CHANGELOG } from '@/constants/changelog'

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
          id={`v-${entry.version.replace(/\./g, "-")}`}
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
