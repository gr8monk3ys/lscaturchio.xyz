'use client'

import Image, { StaticImageData } from 'next/image'
import Link from 'next/link'
import { m } from '@/lib/motion'
import {
  ExternalLink,
  Calendar,
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


function PrimaryProjectLinks({ product }: { product: Product }): React.ReactNode {
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
        <div className="grid grid-cols-2 divide-border border-y border-border sm:grid-cols-4 sm:divide-x">
          {metrics.slice(0, 4).map((metric) => (
            <div key={`${metric.label}-${metric.value}`} className="px-5 py-5 first:pl-0">
              <div className="font-display text-2xl font-semibold tracking-tight tabular-nums">
                {metric.value}
              </div>
              <div className="label-mono mt-2 line-clamp-2">{metric.label}</div>
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

  // Stacked hairline rows, not a three-column tile grid.
  //
  // This was the purest piece of SaaS case-study furniture on the site: three
  // cards headed "The Challenge / The Approach / What Changed", with an orange
  // Target icon and a yellow Lightbulb — two accents the palette does not
  // contain — beside a block filled with `bg-primary/5`, which spends Forest
  // Ink as area rather than as a mark. DESIGN.md names all three as failure
  // modes by name.
  return (
    <section className="border-t border-border">
      <div id="challenge" className="border-b border-border py-8">
        <h3 className="label-mono">The constraint</h3>
        <p className="mt-3 leading-relaxed text-muted-foreground">{caseStudy.challenge}</p>
      </div>

      <div id="solution" className="border-b border-border py-8">
        <h3 className="label-mono">The approach</h3>
        <p className="mt-3 leading-relaxed text-muted-foreground">{caseStudy.solution}</p>
      </div>

      <div className="py-8">
        <h3 className="label-mono">What changed</h3>
        <ul className="mt-3 space-y-2">
          {caseStudy.results.slice(0, 3).map((result) => (
            <li key={result} className="flex items-start gap-3 text-foreground">
              <span className="mt-2.5 h-px w-3 shrink-0 bg-primary" />
              <span>{result}</span>
            </li>
          ))}
        </ul>
      </div>
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
    <section id="process" className="border-t border-border pt-8">
      <div className="label-mono">Process</div>
      <ol className="mt-5 relative border-l border-border/60 pl-6 space-y-6">
        {processSteps.map((step, index) => (
          <li key={`${step.title}-${step.description}`} className="relative">
            <span className="label-mono absolute -left-[13px] top-0 inline-flex h-6 w-6 items-center justify-center bg-background tabular-nums text-foreground">
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
    <section id="outcomes" className="border-t border-border pt-8">
      <h3 className="label-mono mb-4">Outcomes</h3>

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
          <div className="label-mono">
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
    <section id="details" className="border-t border-border pt-8">
      <div className="label-mono mb-4">Details</div>
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

  // Hairline rows, sentence case, no zooming thumbnails. The Flat Paper Rule
  // forbids a lift on hover, and `group-hover:scale-105` on an image is one.
  return (
    <div className="border-t border-border pt-12">
      <h3 className="label-mono">Related projects</h3>
      <ul className="mt-4">
        {relatedProjects.map((relatedProject) => (
          <li key={relatedProject.slug} className="border-b border-border last:border-b-0">
            <Link
              href={`/projects/${relatedProject.slug}`}
              className="group flex items-baseline justify-between gap-6 py-5"
            >
              <div className="min-w-0">
                <h4 className="font-semibold transition-colors group-hover:text-primary">
                  {relatedProject.title}
                </h4>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {relatedProject.description}
                </p>
              </div>
              <span className="label-mono shrink-0 transition-colors group-hover:text-primary">
                Read →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SidebarLinks({ product }: { product: Product }): React.ReactNode {
  if (!product.demoUrl && !product.sourceUrl && !product.sourcePrivate) {
    return null
  }

  return (
    <div className="border-t border-border pt-6">
      <div className="label-mono">Links</div>
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
        <div className="border-t border-border pt-6">
          <div className="label-mono">Tech stack</div>
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

        <div className="border-t border-border pt-6">
          <div className="label-mono">On this page</div>
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
