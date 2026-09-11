"use client"

import { SITE_TECH } from '@/constants/site-tech'

export function TechStack() {
  const stack = [
    { name: SITE_TECH.framework, category: 'Framework' },
    { name: SITE_TECH.library, category: 'Library' },
    { name: SITE_TECH.language, category: 'Language' },
    { name: SITE_TECH.styling, category: 'Styling' },
    { name: SITE_TECH.animations, category: 'Animation' },
    { name: SITE_TECH.database, category: 'Database' },
    { name: 'OpenAI', category: 'AI' },
    { name: SITE_TECH.deployment, category: 'Hosting' },
  ]

  return (
    <div>
      <h2 className="text-section-title mb-4">Tech stack</h2>

      <div className="grid grid-cols-2 divide-x divide-y divide-border border-y border-border">
        {stack.map((tech) => (
          <div key={tech.name} className="px-4 py-3">
            <p className="text-sm font-medium text-foreground truncate">
              {tech.name}
            </p>
            <p className="label-mono mt-1">
              {tech.category}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
