'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { AnimatePresence, m, useReducedMotion } from '@/lib/motion'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Keyboard, ArrowRight } from 'lucide-react'
import type { Product, ProjectCategory, ProjectStatus } from '@/types/products'
import { useGalleryKeyboard } from '@/hooks/use-gallery-keyboard'
import { ProjectRail } from './ProjectRail'

const categoryLabels: Record<ProjectCategory, string> = {
  'ai-ml': 'AI/ML',
  'web-apps': 'Web Apps',
  'tools': 'Tools',
  'open-source': 'Open Source',
  'data-science': 'Data Science',
}

const statusLabels: Record<ProjectStatus, string> = {
  active: 'Active',
  maintained: 'Maintained',
  archived: 'Archived',
}

interface ProjectGalleryState {
  activeSlug: string
  browseMode: boolean
}

type ProjectGalleryAction =
  | { type: 'setActiveSlug'; payload: string }
  | { type: 'toggleBrowseMode' }
  | { type: 'setBrowseMode'; payload: boolean }

function projectGalleryReducer(
  state: ProjectGalleryState,
  action: ProjectGalleryAction
): ProjectGalleryState {
  switch (action.type) {
    case 'setActiveSlug':
      return state.activeSlug === action.payload ? state : { ...state, activeSlug: action.payload }
    case 'toggleBrowseMode':
      return { ...state, browseMode: !state.browseMode }
    case 'setBrowseMode':
      return state.browseMode === action.payload ? state : { ...state, browseMode: action.payload }
    default:
      return state
  }
}

export function ProjectGallery({ projects }: { projects: Product[] }): React.ReactNode {
  const reduceMotion = useReducedMotion()

  const list = useMemo(
    () => projects.filter((p) => typeof p.slug === 'string' && p.slug.length > 0) as Array<Product & { slug: string }>,
    [projects]
  )

  const [{ activeSlug, browseMode }, dispatch] = useReducer(projectGalleryReducer, {
    activeSlug: list[0]?.slug ?? '',
    browseMode: false,
  })

  useEffect(() => {
    if (list.length === 0) return
    if (!activeSlug || !list.some((p) => p.slug === activeSlug)) {
      dispatch({ type: 'setActiveSlug', payload: list[0].slug })
    }
  }, [activeSlug, list])

  const active = useMemo(() => list.find((p) => p.slug === activeSlug) ?? list[0], [activeSlug, list])

  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({})
  const slugs = useMemo(() => list.map((p) => p.slug), [list])

  useEffect(() => {
    if (!browseMode) return
    if (!active?.slug) return
    const el = linkRefs.current[active.slug]
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
  }, [active?.slug, browseMode])

  const handleSetSlug = useCallback((slug: string) => {
    dispatch({ type: 'setActiveSlug', payload: slug })
  }, [])

  const handleToggleBrowse = useCallback(() => {
    dispatch({ type: 'toggleBrowseMode' })
  }, [])

  const handleExitBrowse = useCallback(() => {
    dispatch({ type: 'setBrowseMode', payload: false })
  }, [])

  useGalleryKeyboard({
    activeSlug,
    browseMode,
    linkRefs,
    slugs,
    onSetSlug: handleSetSlug,
    onToggleBrowse: handleToggleBrowse,
    onExitBrowse: handleExitBrowse,
  })

  if (list.length === 0) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card/50 p-10 text-center">
        <p className="text-lg font-medium">No projects match your filters.</p>
        <p className="mt-1 text-sm text-muted-foreground">Try a different category or clear filters.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          Hover a card to preview. Press <span className="font-semibold text-foreground">B</span> for keyboard browse.
        </div>
        <button
          type="button"
          onClick={handleToggleBrowse}
          className={cn(
            'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors',
            browseMode
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'bg-muted/60 text-foreground hover:bg-muted'
          )}
          aria-pressed={browseMode}
        >
          <Keyboard className="h-4 w-4" />
          Browse mode
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout" initial={false}>
            {list.map((project) => {
              const isActive = project.slug === activeSlug
              return (
                <m.div
                  key={project.slug}
                  layout
                  initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
                  animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                >
                  <ProjectGalleryCard
                    project={project}
                    isActive={isActive}
                    onActivate={() => dispatch({ type: 'setActiveSlug', payload: project.slug })}
                    setRef={(el) => {
                      linkRefs.current[project.slug] = el
                    }}
                  />
                </m.div>
              )
            })}
          </AnimatePresence>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <ProjectRail project={active} />
          </div>
        </aside>
      </div>

      <div className="lg:hidden">
        <ProjectRail project={active} compact />
      </div>
    </div>
  )
}

function ProjectGalleryCard({
  project,
  isActive,
  onActivate,
  setRef,
}: {
  project: Product & { slug: string }
  isActive: boolean
  onActivate: () => void
  setRef: (el: HTMLAnchorElement | null) => void
}): React.ReactNode {
  const reduceMotion = useReducedMotion()
  const shared = !reduceMotion

  return (
    <Link
      href={`/projects/${project.slug}`}
      ref={setRef}
      onMouseEnter={onActivate}
      onFocus={onActivate}
      className={cn(
        'group block overflow-hidden rounded-2xl border bg-card/60 backdrop-blur-xs transition-all',
        'hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/5',
        isActive ? 'border-primary/40 ring-1 ring-primary/20' : 'border-border/50 hover:border-primary/25'
      )}
      aria-current={isActive ? 'true' : undefined}
    >
      <div className="relative aspect-16/10 overflow-hidden">
        <m.div
          layoutId={shared ? `project-cover-${project.slug}` : undefined}
          className="absolute inset-0"
        >
          <Image
            src={project.thumbnail}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={isActive}
          />
        </m.div>
        <div className="absolute inset-0 bg-linear-to-t from-background/95 via-background/30 to-transparent" />

        <div className="absolute left-4 right-4 bottom-4 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {(project.categories || []).slice(0, 2).map((c) => (
                <Badge
                  key={c}
                  variant="secondary"
                  className="border border-border/50 bg-background/70 px-2 py-0.5 text-[11px] font-medium"
                >
                  {categoryLabels[c]}
                </Badge>
              ))}
              {project.status && (
                <span className="rounded-full bg-background/70 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                  {statusLabels[project.status]}
                </span>
              )}
            </div>
            <m.div layoutId={shared ? `project-title-${project.slug}` : undefined}>
              <div className="mt-2 truncate text-lg font-semibold tracking-tight">
                {project.title}
              </div>
            </m.div>
          </div>
          <div className="shrink-0 rounded-full bg-primary/10 p-2 text-primary transition-colors group-hover:bg-primary/15">
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>

      <div className="p-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {project.stack?.slice(0, 4).map((t) => (
            <span key={t} className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
              {t}
            </span>
          ))}
          {project.stack && project.stack.length > 4 && (
            <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
              +{project.stack.length - 4}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
