'use client'

import { useMemo } from 'react'
import { StaticImageData } from 'next/image'
import Link from 'next/link'
import { useReducedMotion } from '@/lib/motion'
import { ArrowLeft } from 'lucide-react'

import { Product } from '@/types/products'
import { hasArchitectureDiagram } from '@/components/projects/ProjectArchitectureDiagram'
import { findRelatedProjects } from '@/lib/project-catalogue'
import {
  HeaderSection,
  HeroSection,
  CaseStudyOverview,
  ArchitectureSection,
  ProcessSection,
  OutcomesSection,
  DetailsSection,
  RelatedProjectsSection,
  ProjectSidebar,
} from './product-sections'

export const SingleProduct = ({ product }: { product: Product }) => {
  const activeImage: StaticImageData | string = product.thumbnail

  const reduceMotion = useReducedMotion()
  const shared = !reduceMotion && !!product.slug

  const relatedProjects = useMemo(() => findRelatedProjects(product), [product])

  const caseStudy = product.caseStudy
  const metrics = caseStudy?.metrics ?? []
  // No fallback. `defaultProcessSteps` generated four generic sentences —
  // "Sketched a simple architecture and chose pragmatic tradeoffs for
  // reliability" — and asserted them as facts about a specific build, on a site
  // whose first principle is that every claim has a source. A project without
  // an authored process now shows no process section.
  const processSteps = caseStudy?.process ?? []

  const pageSections = [
    { id: 'overview', label: 'Overview' },
    ...(caseStudy ? [{ id: 'challenge', label: 'Challenge' }, { id: 'solution', label: 'Approach' }] : []),
    ...(hasArchitectureDiagram(product.slug) ? [{ id: 'architecture', label: 'Architecture' }] : []),
    ...(processSteps.length > 0 ? [{ id: 'process', label: 'Process' }] : []),
    ...(caseStudy ? [{ id: 'outcomes', label: 'Outcomes' }] : []),
    ...(product.details && product.details.length > 0 ? [{ id: 'details', label: 'Details' }] : []),
  ]

  return (
    <div className="py-10 max-w-6xl mx-auto">
      {/* Static: page content never mounts at opacity 0 (see DESIGN.md). */}
      <div className="mb-8">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Projects
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-10 items-start">
        <div className="space-y-10">
          <HeaderSection
            metrics={metrics}
            product={product}
            shared={shared}
            status={product.status}
          />
          <HeroSection
            activeImage={activeImage}
            product={product}
            shared={shared}
          />
          <CaseStudyOverview caseStudy={caseStudy} />
          <ArchitectureSection slug={product.slug} />
          {processSteps.length > 0 && <ProcessSection processSteps={processSteps} />}
          <OutcomesSection caseStudy={caseStudy} />
          <DetailsSection details={product.details} />
          <RelatedProjectsSection relatedProjects={relatedProjects} />
        </div>

        <ProjectSidebar pageSections={pageSections} product={product} />
      </div>
    </div>
  )
}
