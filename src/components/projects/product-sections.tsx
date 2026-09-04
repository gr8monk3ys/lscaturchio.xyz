'use client'

import Image, { StaticImageData } from 'next/image'
import Link from 'next/link'
import { m } from '@/lib/motion'
import {
  ExternalLink,
  Calendar,
  Target,
  Lightbulb,
  CheckCircle2,
  Lock,
} from 'lucide-react'
import { IconBrandGithub } from '@tabler/icons-react'

import type { Product, ProjectStatus } from '@/types/products'
import type { CaseStudy, CaseStudyMetric, CaseStudyProcessStep } from '@/types/products'
import { Heading } from '../Heading'
import { Paragraph } from '../Paragraph'
import { Badge } from '@/components/ui/badge'
import {
  ProjectArchitectureDiagram,
  hasArchitectureDiagram,
} from '@/components/projects/ProjectArchitectureDiagram'
import { cn } from '@/lib/utils'
import {
  PROJECT_CATEGORY_LABELS,
  projectStatusLabel,
  projectStatusTone,
} from '@/lib/project-catalogue' 


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
  if (!product.demoUrl && !product.sourceUrl && !product.sourcePrivate) {
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
          <IconBrandGithub className="h-4 w-4" />
          View Source
        </a>
      )}
      {product.sourcePrivate && (
        <span
          className="inline-flex items-center gap-2 bg-muted/50 text-muted-foreground px-5 py-2.5 rounded-xl font-medium cursor-default"
          title="The repository is private, so there is no public source link."
        >
          <Lock className="h-4 w-4" />
          Private repo
        </span>
      )}
    </div>
  )
}

type HeaderSectionProps = {
  metrics: CaseStudyMetric[]
  product: Product
  shared: boolean
  status: ProjectStatus | undefined
}

export function HeaderSection({ metrics, product, shared, status }: HeaderSectionProps): React.ReactNode {
  const statusTone = projectStatusTone(status)
  return (
    <header id="overview" className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <div
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
            statusTone.bg,
            statusTone.text
          )}
        >
          <span className={cn('h-1.5 w-1.5 rounded-full', statusTone.dot)} />
          {projectStatusLabel(status)}
        </div>

        {product.categories?.map((category) => (
          <Badge key={category} variant="secondary">
            {PROJECT_CATEGORY_LABELS[category]}
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
    <div className="rounded-2xl border border-border/50 overflow-hidden">
      <m.div
        layoutId={shared ? `project-cover-${product.slug}` : undefined}
        className={cn('relative aspect-video overflow-hidden', 'bg-accent/40')}
      >
        <Image
          src={activeImage}
          alt={`${product.title} project visual`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 80vw"
          priority
        />
      </m.div>
    </div>
  )
}

export function CaseStudyOverview({ caseStudy }: { caseStudy: CaseStudy | undefined }): React.ReactNode {
  if (!caseStudy) return null

  return (
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
  )
}

export function ArchitectureSection({ slug }: { slug?: string }): React.ReactNode {
  // No diagram means no section. A placeholder that says the architecture
  // "varies by deployment" tells the reader nothing and reads as unfinished.
  if (!hasArchitectureDiagram(slug)) return null

  return (
    <section id="architecture">
      <ProjectArchitectureDiagram slug={slug ?? ''} />
    </section>
  )
}

export function ProcessSection({ processSteps }: { processSteps: CaseStudyProcessStep[] }): React.ReactNode {
  return (
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
  )
}

export function OutcomesSection({ caseStudy }: { caseStudy: CaseStudy | undefined }): React.ReactNode {
  if (!caseStudy) return null

  return (
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
  )
}

export function DetailsSection({ details }: { details: string[] | undefined }): React.ReactNode {
  if (!details || details.length === 0) return null

  return (
    <section id="details" className="rounded-2xl border border-border/50 bg-card/50 p-6">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">Details</div>
      <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground prose-headings:text-foreground prose-p:text-muted-foreground">
        {details.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </section>
  )
}

export function RelatedProjectsSection({ relatedProjects }: { relatedProjects: Product[] }): React.ReactNode {
  if (relatedProjects.length === 0) return null

  return (
    <div className="border-t border-border/50 pt-12">
      <h3 className="text-xl font-semibold mb-6">Related Projects</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedProjects.map((relatedProject) => (
          <Link
            key={relatedProject.slug}
            href={`/projects/${relatedProject.slug}`}
            className="group block p-4 rounded-xl border border-border/50 bg-card/50 transition-colors hover:border-primary/45 hover:bg-primary/6"
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
    </div>
  )
}

function SidebarLinks({ product }: { product: Product }): React.ReactNode {
  if (!product.demoUrl && !product.sourceUrl && !product.sourcePrivate) {
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
            <IconBrandGithub className="h-4 w-4" />
          </a>
        )}
        {product.sourcePrivate && (
          <span
            className="inline-flex items-center justify-between rounded-xl bg-muted/50 px-4 py-2 text-sm font-medium text-muted-foreground cursor-default"
            title="The repository is private, so there is no public source link."
          >
            Private repo
            <Lock className="h-4 w-4" />
          </span>
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
