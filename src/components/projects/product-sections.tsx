'use client'

import Image, { StaticImageData } from 'next/image'
import Link from 'next/link'
import { m } from '@/lib/motion'
import {
  ExternalLink,
  Github,
  Calendar,
  Target,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react'

import type { Product, ProjectStatus, ProjectCategory } from '@/types/products'
import type { CaseStudy, CaseStudyMetric, CaseStudyProcessStep } from '@/types/products'
import { Heading } from '../Heading'
import { Paragraph } from '../Paragraph'
import { Badge } from '@/components/ui/badge'
import { Reveal } from '@/components/motion/reveal'
import { ProjectArchitectureDiagram } from '@/components/projects/ProjectArchitectureDiagram'
import { cn } from '@/lib/utils'

export const statusColors: Record<ProjectStatus, { bg: string; text: string; dotBg: string; label: string }> = {
  active: { bg: 'bg-success-muted', text: 'text-success', dotBg: 'bg-success', label: 'Active' },
  maintained: {
    bg: 'bg-warning-muted',
    text: 'text-warning',
    dotBg: 'bg-warning',
    label: 'Maintained',
  },
  archived: {
    bg: 'bg-muted',
    text: 'text-muted-foreground',
    dotBg: 'bg-muted-foreground',
    label: 'Archived',
  },
}

export const categoryLabels: Record<ProjectCategory, string> = {
  'ai-ml': 'AI/ML',
  'web-apps': 'Web Apps',
  'tools': 'Tools',
  'open-source': 'Open Source',
  'data-science': 'Data Science',
}

export function deriveMetricsFromResults(results: string[] | undefined): CaseStudyMetric[] {
  if (!results || results.length === 0) return []

  const metrics: CaseStudyMetric[] = []
  for (const item of results) {
    const match = item.match(/(\+?\d+%|\d+\/\d+|24\/7)/)
    if (!match) continue

    const value = match[1]
    const label = item.replace(match[0], '').replace(/^[\s:–—-]+/, '').trim()
    metrics.push({ value, label: label || 'Impact' })

    if (metrics.length >= 4) break
  }

  return metrics
}

export function defaultProcessSteps(title: string): CaseStudyProcessStep[] {
  return [
    {
      title: 'Scope',
      description: `Clarified goals, constraints, and success criteria for ${title}.`,
    },
    {
      title: 'Design',
      description: 'Sketched a simple architecture and chose pragmatic tradeoffs for reliability.',
    },
    {
      title: 'Build',
      description: 'Implemented the core loop end-to-end, then hardened edges and failure paths.',
    },
    {
      title: 'Evaluate',
      description: 'Validated outcomes, cleaned up UX, and documented decisions for reuse.',
    },
  ]
}

export function PrimaryProjectLinks({ product }: { product: Product }): React.ReactNode {
  if (!product.demoUrl && !product.sourceUrl && !product.href) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-3 pt-2">
      {product.demoUrl && (
        <a
          href={product.demoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          Live Demo
        </a>
      )}
      {product.sourceUrl && (
        <a
          href={product.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-muted text-foreground px-5 py-2.5 rounded-xl font-medium hover:bg-muted/80 transition-colors"
        >
          <Github className="h-4 w-4" />
          View Source
        </a>
      )}
      {!product.demoUrl && !product.sourceUrl && product.href && (
        <a
          href={product.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          View Project
        </a>
      )}
    </div>
  )
}

type HeaderSectionProps = {
  metrics: CaseStudyMetric[]
  product: Product
  shared: boolean
  statusConfig: { bg: string; text: string; dotBg: string; label: string }
}

export function HeaderSection({ metrics, product, shared, statusConfig }: HeaderSectionProps): React.ReactNode {
  return (
    <header id="overview" className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <div
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
            statusConfig.bg,
            statusConfig.text
          )}
        >
          <span className={cn('h-1.5 w-1.5 rounded-full', statusConfig.dotBg)} />
          {statusConfig.label}
        </div>

        {product.categories?.map((category) => (
          <Badge key={category} variant="secondary">
            {categoryLabels[category]}
          </Badge>
        ))}

        {product.startDate && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {new Date(product.startDate + '-01').toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
        )}
      </div>

      <m.div layoutId={shared ? `project-title-${product.slug}` : undefined}>
        <Heading className="font-bold text-3xl md:text-5xl leading-[1.05]">{product.title}</Heading>
      </m.div>

      <Paragraph className="text-lg text-muted-foreground">{product.description}</Paragraph>

      <PrimaryProjectLinks product={product} />

      {metrics.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {metrics.slice(0, 4).map((metric) => (
            <div
              key={`${metric.label}-${metric.value}`}
              className="rounded-2xl border border-border/50 bg-card/50 px-4 py-3"
            >
              <div className="text-xl font-semibold tracking-tight tabular-nums">{metric.value}</div>
              <div className="mt-1 text-xs text-muted-foreground line-clamp-2">{metric.label}</div>
            </div>
          ))}
        </div>
      )}
    </header>
  )
}

type HeroSectionProps = {
  activeImage: StaticImageData | string
  product: Product
  shared: boolean
}

export function HeroSection({ activeImage, product, shared }: HeroSectionProps): React.ReactNode {
  return (
    <Reveal>
      <m.div
        className="rounded-2xl border border-border/50 overflow-hidden"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <m.div
          layoutId={shared ? `project-cover-${product.slug}` : undefined}
          className={cn(
            'relative aspect-video overflow-hidden',
            'bg-linear-to-br from-accent/70 via-background to-secondary/10'
          )}
        >
          <div className="pointer-events-none absolute -top-16 -right-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-24 h-72 w-72 rounded-full bg-secondary/10 blur-3xl" />
          <Image
            src={activeImage}
            alt={`${product.title} project visual`}
            fill
            className="object-contain p-10"
            sizes="(max-width: 768px) 100vw, 80vw"
            priority
          />
        </m.div>
      </m.div>
    </Reveal>
  )
}

export function CaseStudyOverview({ caseStudy }: { caseStudy: CaseStudy | undefined }): React.ReactNode {
  if (!caseStudy) return null

  return (
    <Reveal>
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.9fr)]">
        <section id="challenge" className="rounded-2xl border border-border/50 bg-card/50 p-6">
          <div className="mb-3 flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-500" />
            <h3 className="font-semibold">The Challenge</h3>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{caseStudy.challenge}</p>
        </section>

        <section id="solution" className="rounded-2xl border border-border/50 bg-card/50 p-6">
          <div className="mb-3 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <h3 className="font-semibold">The Approach</h3>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{caseStudy.solution}</p>
        </section>

        <section className="rounded-2xl border border-primary/18 bg-primary/5 p-6">
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">What Changed</h3>
          </div>
          <ul className="space-y-2">
            {caseStudy.results.slice(0, 3).map((result) => (
              <li key={result} className="flex items-start gap-2 text-sm text-foreground">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>{result}</span>
              </li>
            ))}
          </ul>
        </section>
      </section>
    </Reveal>
  )
}

export function ArchitectureSection({ slug }: { slug?: string }): React.ReactNode {
  const shouldRenderFallback =
    !slug ||
    (slug !== 'talker' &&
      slug !== 'ai-powered-trading-bot' &&
      slug !== 'leetcode-solver-bot' &&
      slug !== 'blog-ai')

  return (
    <Reveal>
      <section id="architecture">
        <ProjectArchitectureDiagram slug={slug ?? ''} />
        {shouldRenderFallback ? (
          <div className="rounded-2xl border border-border/50 bg-card/50 p-6">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Architecture
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              This case study focuses on outcomes and implementation details. The high-level architecture varies by
              deployment and is best explained in context.
            </p>
          </div>
        ) : null}
      </section>
    </Reveal>
  )
}

export function ProcessSection({ processSteps }: { processSteps: CaseStudyProcessStep[] }): React.ReactNode {
  return (
    <Reveal>
      <section id="process" className="rounded-2xl border border-border/50 bg-card/50 p-6">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Process</div>
        <ol className="mt-5 relative border-l border-border/60 pl-6 space-y-6">
          {processSteps.map((step, index) => (
            <li key={`${step.title}-${step.description}`} className="relative">
              <span className="absolute -left-[13px] top-0 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary tabular-nums">
                {index + 1}
              </span>
              <div className="font-semibold">{step.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
            </li>
          ))}
        </ol>
      </section>
    </Reveal>
  )
}

export function OutcomesSection({ caseStudy }: { caseStudy: CaseStudy | undefined }): React.ReactNode {
  if (!caseStudy) return null

  return (
    <Reveal>
      <section id="outcomes" className="rounded-2xl border border-primary/18 bg-primary/5 p-6">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Outcomes</h3>
        </div>

        <ul className="space-y-2">
          {caseStudy.results.map((result) => (
            <li key={result} className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <span className="text-foreground">{result}</span>
            </li>
          ))}
        </ul>

        {caseStudy.whatIdDoNext && caseStudy.whatIdDoNext.length > 0 && (
          <div className="mt-6 rounded-xl border border-border/50 bg-background/60 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              What I&apos;d do next
            </div>
            <ul className="mt-2 space-y-2">
              {caseStudy.whatIdDoNext.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </Reveal>
  )
}

export function DetailsSection({ details }: { details: string[] | undefined }): React.ReactNode {
  if (!details || details.length === 0) return null

  return (
    <Reveal>
      <section id="details" className="rounded-2xl border border-border/50 bg-card/50 p-6">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">Details</div>
        <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground prose-headings:text-foreground prose-p:text-muted-foreground">
          {details.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </section>
    </Reveal>
  )
}

export function RelatedProjectsSection({ relatedProjects }: { relatedProjects: Product[] }): React.ReactNode {
  if (relatedProjects.length === 0) return null

  return (
    <m.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="border-t border-border/50 pt-12"
    >
      <h3 className="text-xl font-semibold mb-6">Related Projects</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedProjects.map((relatedProject) => (
          <Link
            key={relatedProject.slug}
            href={`/projects/${relatedProject.slug}`}
            className="group block p-4 rounded-xl border border-border/50 bg-card/50 hover:border-primary/30 hover:shadow-md transition-all"
          >
            <div className="relative aspect-video rounded-lg overflow-hidden mb-3">
              <Image
                src={relatedProject.thumbnail}
                alt={relatedProject.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 100vw, 33vw"
              />
            </div>
            <h4 className="font-semibold group-hover:text-primary transition-colors">{relatedProject.title}</h4>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{relatedProject.description}</p>
          </Link>
        ))}
      </div>
    </m.div>
  )
}

function SidebarLinks({ product }: { product: Product }): React.ReactNode {
  if (!product.demoUrl && !product.sourceUrl && !product.href) {
    return null
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-card/50 p-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Links</div>
      <div className="mt-4 flex flex-col gap-2">
        {product.demoUrl && (
          <a
            href={product.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-between rounded-xl bg-muted px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/80 transition-colors"
          >
            Live demo
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
        {product.sourceUrl && (
          <a
            href={product.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-between rounded-xl bg-muted px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/80 transition-colors"
          >
            Source
            <Github className="h-4 w-4" />
          </a>
        )}
        {!product.demoUrl && !product.sourceUrl && product.href && (
          <a
            href={product.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-between rounded-xl bg-muted px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/80 transition-colors"
          >
            Project
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>
    </div>
  )
}

type SidebarProps = {
  pageSections: { id: string; label: string }[]
  product: Product
}

export function ProjectSidebar({ pageSections, product }: SidebarProps): React.ReactNode {
  return (
    <aside className="hidden xl:block">
      <div className="sticky top-24 space-y-4">
        <div className="rounded-2xl border border-border/50 bg-card/50 p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tech stack</div>
          {product.stack && product.stack.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {product.stack.map((tech) => (
                <span key={tech} className="px-3 py-1.5 text-sm bg-muted rounded-lg text-foreground">
                  {tech}
                </span>
              ))}
            </div>
          ) : (
            <div className="mt-3 text-sm text-muted-foreground">Not specified.</div>
          )}
        </div>

        <div className="rounded-2xl border border-border/50 bg-card/50 p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">On this page</div>
          <nav className="mt-4 space-y-1 text-sm">
            {pageSections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="block rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              >
                {section.label}
              </a>
            ))}
          </nav>
        </div>

        <SidebarLinks product={product} />
      </div>
    </aside>
  )
}
