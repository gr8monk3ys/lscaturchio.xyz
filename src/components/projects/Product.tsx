'use client'

import { useMemo, useState } from 'react'
import { StaticImageData } from 'next/image'
import Link from 'next/link'
import { m, useReducedMotion } from '@/lib/motion'
import { ArrowLeft } from 'lucide-react'

import { Product } from '@/types/products'
import { products } from '@/constants/products'
import {
  statusColors,
  deriveMetricsFromResults,
  defaultProcessSteps,
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
  const [activeImage, setActiveImage] = useState<StaticImageData | string>(product.thumbnail)

  const status = product.status || 'active'
  const statusConfig = statusColors[status]
  const reduceMotion = useReducedMotion()
  const shared = !reduceMotion && !!product.slug

  const relatedProjects = useMemo(() => {
    if (!product.categories || product.categories.length === 0) return []

    return products
      .filter(
        (candidate) =>
          candidate.slug !== product.slug &&
          candidate.categories?.some((category) => product.categories?.includes(category))
      )
      .slice(0, 3)
  }, [product])

  const caseStudy = product.caseStudy
  const metrics =
    caseStudy?.metrics && caseStudy.metrics.length > 0
      ? caseStudy.metrics
      : deriveMetricsFromResults(caseStudy?.results)
  const processSteps =
    caseStudy?.process && caseStudy.process.length > 0
      ? caseStudy.process
      : defaultProcessSteps(product.title)

  const pageSections = [
    { id: 'overview', label: 'Overview' },
    ...(caseStudy ? [{ id: 'challenge', label: 'Challenge' }, { id: 'solution', label: 'Approach' }] : []),
    { id: 'architecture', label: 'Architecture' },
    { id: 'process', label: 'Process' },
    ...(caseStudy ? [{ id: 'outcomes', label: 'Outcomes' }] : []),
    ...(product.content ? [{ id: 'details', label: 'Details' }] : []),
  ]

  return (
    <div className="py-10 max-w-6xl mx-auto">
      <m.div
        initial={{ opacity: 0, x: -14 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25 }}
        className="mb-8"
      >
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Projects
        </Link>
      </m.div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-10 items-start">
        <div className="space-y-10">
          <HeaderSection
            metrics={metrics}
            product={product}
            shared={shared}
            statusConfig={statusConfig}
          />
          <HeroSection
            activeImage={activeImage}
            onSelectImage={setActiveImage}
            product={product}
            shared={shared}
          />
          <CaseStudyOverview caseStudy={caseStudy} />
          <ArchitectureSection slug={product.slug} />
          <ProcessSection processSteps={processSteps} />
          <OutcomesSection caseStudy={caseStudy} />
          <DetailsSection content={product.content} />
          <RelatedProjectsSection relatedProjects={relatedProjects} />
        </div>

        <ProjectSidebar pageSections={pageSections} product={product} />
      </div>
    </div>
  )
}
