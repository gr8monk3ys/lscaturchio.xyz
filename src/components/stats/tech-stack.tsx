"use client"

import { Code2 } from 'lucide-react'
import { SITE_TECH } from '@/constants/site-tech'

export function TechStack() {
  const stack = [
    { name: SITE_TECH.framework, category: 'Framework', color: 'bg-black dark:bg-white' },
    { name: SITE_TECH.library, category: 'Library', color: 'bg-blue-500' },
    { name: SITE_TECH.language, category: 'Language', color: 'bg-blue-600' },
    { name: SITE_TECH.styling, category: 'Styling', color: 'bg-cyan-500' },
    { name: SITE_TECH.animations, category: 'Animation', color: 'bg-purple-500' },
    { name: SITE_TECH.database, category: 'Database', color: 'bg-green-600' },
    { name: 'OpenAI', category: 'AI', color: 'bg-emerald-500' },
    { name: SITE_TECH.deployment, category: 'Hosting', color: 'bg-black dark:bg-white' },
  ]

  return (
    <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-2 mb-6">
        <Code2 className="h-5 w-5 text-primary" />
        <h3 className="text-xl font-semibold">Tech Stack</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stack.map((tech) => (
          <div
            key={tech.name}
            className="flex items-center gap-3 p-3 rounded-md border border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary transition-colors"
          >
            <div className={`w-3 h-3 rounded-full ${tech.color}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {tech.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {tech.category}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
