'use client'

import Image from 'next/image'
import Link from 'next/link'
import { m, useMotionPreset, useReducedMotion } from '@/lib/motion'
import { cn } from '@/lib/utils'
import {
  PROJECT_CATEGORY_LABELS,
  projectStatusLabel,
} from '@/lib/project-catalogue' 
import { Calendar, ExternalLink, ArrowRight } from 'lucide-react'
import { IconBrandGithub } from '@tabler/icons-react'
import type { Product } from '@/types/products'


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
  const tags = (project.categories || []).map((c) => PROJECT_CATEGORY_LABELS[c])
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
        <div className="absolute inset-x-0 bottom-0 h-1/5 bg-linear-to-t from-background/60 to-transparent" />
      </div>

      <div className="p-5 space-y-4">
        <Shell
          key={shellKey}
          {...(!reduceMotion
            ? {
                // Never mount hidden: the panel's content must survive a
                // missed mount animation.
                initial: false as const,
                animate: { opacity: 1, y: 0 },
                transition: fastTransition,
              }
            : {})}
        >
          <div className="space-y-2">
            <span className="label-mono flex items-center gap-2">
              {project.status && (
                <span>{projectStatusLabel(project.status)}</span>
              )}
              {project.status && when && <span aria-hidden>·</span>}
              {when && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {when}
                </span>
              )}
            </span>
            {/* Same order as the card: the claim, then the name as a label. */}
            {/* Not a heading — and this element has been flipped once already,
                so the reasoning matters.

                It became an `h2` when the rail was the only thing on /projects
                supplying a document outline ("eighteen projects, one heading on
                the page"). `ProjectGalleryCard` then grew its own `h2`, with
                its own comment saying each card is a top-level section of this
                page — which is right, and which made this one redundant rather
                than load-bearing.

                The rail is a *preview of the active card*. It repeats a heading
                the page already has, and because the rail is mounted twice
                (desktop `aside`, mobile `compact`) the active project's thesis
                rendered as an `h2` three times: measured 21 `h2`s on a page
                whose own filter chip correctly reads "All 18", with "Decide
                what merges without a human" appearing at positions 1, 19 and
                20. A review read that as the portfolio shipping a duplicate.

                A preview echoing a heading is not a section, so it is styled
                text. The outline is the eighteen cards. */}
            <p className="text-card-title text-balance">{project.thesis ?? title}</p>
            {project.thesis && (
              <span className="label-mono text-foreground">{title}</span>
            )}
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>

          {tags.length > 0 && (
            <p className="label-mono normal-case tracking-normal text-muted-foreground">
              {tags.slice(0, 3).join('  ·  ')}
            </p>
          )}

          {highlights.length > 0 && (
            /* Hairline, not a tinted panel. `bg-primary/5` under an uppercase
               `text-primary` heading spent Forest Ink as area and as a heading
               colour in the same block — the One Pen Rule's named failure, twice.
               The ink stays on the marks. */
            <div className="border-t border-border pt-4">
              <span className="label-mono block">Highlights</span>
              <ul className="mt-3 space-y-2 text-sm text-foreground">
                {highlights.map((result) => (
                  <li key={result.key} className="flex items-start gap-3">
                    <span className="mt-2.5 h-px w-3 shrink-0 bg-primary" />
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
                <IconBrandGithub className="h-4 w-4" />
                Source
              </a>
            )}
          </div>
        </Shell>
      </div>
    </div>
  )
}
