'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { AnimatePresence, m, useMotionPreset, useReducedMotion } from '@/lib/motion'
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
  const fastTransition = useMotionPreset('fast')

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
      <div className="border-y border-border py-16 text-center">
        <p className="text-lg font-medium">No projects match your filters.</p>
        <p className="mt-1 text-sm text-muted-foreground">Try a different category or clear filters.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="label-mono">
          Hover to preview · press <span className="text-foreground">B</span> to keyboard-browse
        </div>
        <button
          type="button"
          onClick={handleToggleBrowse}
          className={cn(
            'label-mono inline-flex items-center justify-center gap-2 border px-4 py-2 transition-colors',
            browseMode
              ? 'border-primary text-primary'
              : 'border-border text-muted-foreground hover:text-foreground'
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
                  transition={fastTransition}
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
        'group block overflow-hidden border transition-colors',
        isActive ? 'border-primary' : 'border-border hover:border-primary/45'
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
            <span className="label-mono block truncate">
              {[
                ...(project.categories || []).slice(0, 2).map((c) => categoryLabels[c]),
                ...(project.status ? [statusLabels[project.status]] : []),
              ].join("  ·  ")}
            </span>
            <m.div layoutId={shared ? `project-title-${project.slug}` : undefined}>
              <div className="mt-1.5 truncate text-lg font-semibold tracking-tight">
                {project.title}
              </div>
            </m.div>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
        </div>
      </div>

      <div className="p-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
        {project.stack && project.stack.length > 0 && (
          <p className="label-mono mt-3 normal-case tracking-normal text-muted-foreground">
            {project.stack.slice(0, 4).join("  ·  ")}
            {project.stack.length > 4 && `  ·  +${project.stack.length - 4}`}
          </p>
        )}
      </div>
    </Link>
  )
}
