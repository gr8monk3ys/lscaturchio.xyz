'use client'

import Image from 'next/image'
import Link from 'next/link'
import { m, useMotionPreset, useReducedMotion } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { Calendar, ExternalLink, Github, ArrowRight } from 'lucide-react'
import type { Product, ProjectCategory } from '@/types/products'

const categoryLabels: Record<ProjectCategory, string> = {
  'ai-ml': 'AI/ML',
  'web-apps': 'Web Apps',
  'tools': 'Tools',
  'open-source': 'Open Source',
  'data-science': 'Data Science',
}

function formatStartDate(startDate?: string): string | null {
  if (!startDate) return null
  const value = `${startDate}-01`
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return null
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function toStableListItems(values: string[], prefix: string): Array<{ key: string; value: string }> {
  const counts = new Map<string, number>()
  return values.map((value) => {
    const count = counts.get(value) ?? 0
    counts.set(value, count + 1)
    return {
      key: `${prefix}-${value}-${count}`,
      value,
    }
  })
}

type ProjectRailProps = {
  project: (Product & { slug?: string }) | undefined
  compact?: boolean
}

export function ProjectRail({ project, compact = false }: ProjectRailProps): React.ReactNode {
  const reduceMotion = useReducedMotion()
  const fastTransition = useMotionPreset('fast')

  if (!project) return null

  const when = formatStartDate(project.startDate)
  const title = project.title
  const description = project.description
  const tags = (project.categories || []).map((c) => categoryLabels[c])
  const highlights = toStableListItems(
    (project.caseStudy?.results ?? []).slice(0, 3),
    project.slug ?? project.title
  )

  const Shell = reduceMotion ? 'div' : (m.div as unknown as 'div')
  const shellKey = project.slug ?? project.title

  return (
    <div
      className="overflow-hidden border border-border"
    >
      <div className={cn('relative', compact ? 'aspect-video' : 'aspect-16/10')}>
        <Image
          src={project.thumbnail}
          alt={`${title} preview`}
          fill
          className="object-cover"
          sizes={compact ? '100vw' : '380px'}
        />
        <div className="absolute inset-0 bg-linear-to-t from-background/95 via-background/30 to-transparent" />
      </div>

      <div className="p-5 space-y-4">
        <Shell
          key={shellKey}
          {...(!reduceMotion
            ? {
                initial: { opacity: 0, y: 8 },
                animate: { opacity: 1, y: 0 },
                transition: fastTransition,
              }
            : {})}
        >
          <div className="space-y-2">
            <span className="label-mono flex items-center gap-2">
              {project.status && (
                <span>{project.status === 'active' ? 'Active' : project.status === 'maintained' ? 'Maintained' : 'Archived'}</span>
              )}
              {project.status && when && <span aria-hidden>·</span>}
              {when && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {when}
                </span>
              )}
            </span>
            <div className="font-display text-xl font-semibold tracking-tight">{title}</div>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>

          {tags.length > 0 && (
            <p className="label-mono normal-case tracking-normal text-muted-foreground">
              {tags.slice(0, 3).join('  ·  ')}
            </p>
          )}

          {highlights.length > 0 && (
            <div className="rounded-xl border border-primary/15 bg-primary/5 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-primary">
                Highlights
              </div>
              <ul className="mt-2 space-y-1.5 text-sm text-foreground">
                {highlights.map((result) => (
                  <li key={result.key} className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{result.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Link
              href={project.slug ? `/projects/${project.slug}` : '/projects'}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              View case study
              <ArrowRight className="h-4 w-4" />
            </Link>
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-muted px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/80 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Demo
              </a>
            )}
            {project.sourceUrl && (
              <a
                href={project.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-muted px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/80 transition-colors"
              >
                <Github className="h-4 w-4" />
                Source
              </a>
            )}
          </div>
        </Shell>
      </div>
    </div>
  )
}
