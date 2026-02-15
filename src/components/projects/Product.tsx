"use client";

import { Product, ProjectStatus, ProjectCategory } from "@/types/products";
import { products } from "@/constants/products";
import Image, { StaticImageData } from "next/image";
import React, { useState, useMemo } from "react";
import { Heading } from "../Heading";
import { Paragraph } from "../Paragraph";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/motion/reveal";
import { ProjectArchitectureDiagram } from "@/components/projects/ProjectArchitectureDiagram";
import {
  ArrowLeft,
  ExternalLink,
  Github,
  Calendar,
  Target,
  Lightbulb,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CaseStudyMetric, CaseStudyProcessStep } from "@/types/products";

const statusColors: Record<ProjectStatus, { bg: string; text: string; dotBg: string; label: string }> = {
  active: { bg: "bg-success-muted", text: "text-success", dotBg: "bg-success", label: "Active" },
  maintained: { bg: "bg-warning-muted", text: "text-warning", dotBg: "bg-warning", label: "Maintained" },
  archived: { bg: "bg-muted", text: "text-muted-foreground", dotBg: "bg-muted-foreground", label: "Archived" },
};

const categoryLabels: Record<ProjectCategory, string> = {
  "ai-ml": "AI/ML",
  "web-apps": "Web Apps",
  "tools": "Tools",
  "open-source": "Open Source",
  "data-science": "Data Science",
};

function deriveMetricsFromResults(results: string[] | undefined): CaseStudyMetric[] {
  if (!results || results.length === 0) return [];
  const metrics: CaseStudyMetric[] = [];

  for (const item of results) {
    const match = item.match(/(\+?\d+%|\d+\/\d+|24\/7)/);
    if (!match) continue;
    const value = match[1];
    const label = item.replace(match[0], "").replace(/^[\s:–—-]+/, "").trim();
    metrics.push({ value, label: label || "Impact" });
    if (metrics.length >= 4) break;
  }

  return metrics;
}

function defaultProcessSteps(title: string): CaseStudyProcessStep[] {
  return [
    { title: "Scope", description: `Clarified goals, constraints, and success criteria for ${title}.` },
    { title: "Design", description: "Sketched a simple architecture and chose pragmatic tradeoffs for reliability." },
    { title: "Build", description: "Implemented the core loop end-to-end, then hardened edges and failure paths." },
    { title: "Evaluate", description: "Validated outcomes, cleaned up UX, and documented decisions for reuse." },
  ];
}

export const SingleProduct = ({ product }: { product: Product }) => {
  const [activeImage, setActiveImage] = useState<StaticImageData | string>(
    product.thumbnail
  );

  const status = product.status || "active";
  const statusConfig = statusColors[status];
  const reduceMotion = useReducedMotion();
  const shared = !reduceMotion && !!product.slug;

  // Get related projects (same category, excluding current)
  const relatedProjects = useMemo(() => {
    if (!product.categories || product.categories.length === 0) return [];
    return products
      .filter(
        (p) =>
          p.slug !== product.slug &&
          p.categories?.some((c) => product.categories?.includes(c))
      )
      .slice(0, 3);
  }, [product]);

  const caseStudy = product.caseStudy;
  const metrics = caseStudy?.metrics?.length ? caseStudy.metrics : deriveMetricsFromResults(caseStudy?.results);
  const processSteps = caseStudy?.process?.length ? caseStudy.process : defaultProcessSteps(product.title);

  const pageSections = [
    { id: "overview", label: "Overview" },
    ...(caseStudy ? [{ id: "challenge", label: "Challenge" }, { id: "solution", label: "Solution" }] : []),
    { id: "architecture", label: "Architecture" },
    { id: "process", label: "Process" },
    ...(caseStudy ? [{ id: "outcomes", label: "Outcomes" }] : []),
    ...(product.content ? [{ id: "details", label: "Details" }] : []),
  ];

  return (
    <div className="py-10 max-w-6xl mx-auto">
      <motion.div
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
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-10 items-start">
        <div className="space-y-10">
          {/* Header */}
          <header id="overview" className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <div
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                  statusConfig.bg,
                  statusConfig.text
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", statusConfig.dotBg)} />
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
                    {new Date(product.startDate + "-01").toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>

            <motion.div layoutId={shared ? `project-title-${product.slug}` : undefined}>
              <Heading className="font-bold text-3xl md:text-5xl leading-[1.05]">
                {product.title}
              </Heading>
            </motion.div>
            <Paragraph className="text-lg text-muted-foreground">
              {product.description}
            </Paragraph>

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

            {/* Metrics strip */}
            {metrics.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {metrics.slice(0, 4).map((m) => (
                  <div
                    key={`${m.label}-${m.value}`}
                    className="rounded-2xl border border-border/50 bg-card/50 px-4 py-3"
                  >
                    <div className="text-xl font-semibold tracking-tight tabular-nums">
                      {m.value}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {m.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </header>

          {/* Hero visual */}
          <Reveal>
            <motion.div
              className="rounded-2xl border border-border/50 overflow-hidden"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                layoutId={shared ? `project-cover-${product.slug}` : undefined}
                className={cn(
                  "relative aspect-[16/9] overflow-hidden",
                  "bg-gradient-to-br from-accent/70 via-background to-secondary/10"
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
              </motion.div>

              {/* Image Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex flex-row justify-center my-4 flex-wrap gap-2 px-6 pb-6">
                  {product.images.map((image, idx) => (
                    <button
                      onClick={() => setActiveImage(image)}
                      key={`image-thumbnail-${idx}`}
                      className={cn(
                        "relative rounded-lg overflow-hidden border-2 transition-all bg-background",
                        activeImage === image
                          ? "border-primary"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <Image
                        src={image}
                        alt={`${product.title} thumbnail ${idx + 1}`}
                        width={80}
                        height={60}
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </Reveal>

          {/* Case Study */}
          {caseStudy && (
            <div className="space-y-8">
              <Reveal>
                <section
                  id="challenge"
                  className="rounded-2xl border border-border/50 bg-card/50 p-6"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="h-5 w-5 text-orange-500" />
                    <h3 className="font-semibold">The Challenge</h3>
                  </div>
                  <p className="text-muted-foreground">{caseStudy.challenge}</p>
                </section>
              </Reveal>

              <Reveal delayMs={40}>
                <section
                  id="solution"
                  className="rounded-2xl border border-border/50 bg-card/50 p-6"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    <h3 className="font-semibold">The Solution</h3>
                  </div>
                  <p className="text-muted-foreground">{caseStudy.solution}</p>
                </section>
              </Reveal>
            </div>
          )}

          <Reveal>
            <section id="architecture">
              <ProjectArchitectureDiagram slug={product.slug ?? ""} />
              {!product.slug || (
                product.slug !== "talker" &&
                product.slug !== "ai-powered-trading-bot" &&
                product.slug !== "leetcode-solver-bot" &&
                product.slug !== "blog-ai"
              ) ? (
                <div className="rounded-2xl border border-border/50 bg-card/50 p-6">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Architecture
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    This case study focuses on outcomes and implementation details. The high-level architecture varies
                    by deployment and is best explained in context.
                  </p>
                </div>
              ) : null}
            </section>
          </Reveal>

          <Reveal>
            <section
              id="process"
              className="rounded-2xl border border-border/50 bg-card/50 p-6"
            >
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Process
              </div>
              <ol className="mt-5 relative border-l border-border/60 pl-6 space-y-6">
                {processSteps.map((step, idx) => (
                  <li key={`${step.title}-${idx}`} className="relative">
                    <span className="absolute -left-[13px] top-0 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary tabular-nums">
                      {idx + 1}
                    </span>
                    <div className="font-semibold">{step.title}</div>
                    <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                  </li>
                ))}
              </ol>
            </section>
          </Reveal>

          {caseStudy && (
            <Reveal>
              <section
                id="outcomes"
                className="rounded-2xl border border-primary/18 bg-primary/5 p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Outcomes</h3>
                </div>
                <ul className="space-y-2">
                  {caseStudy.results.map((result, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
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
                      {caseStudy.whatIdDoNext.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            </Reveal>
          )}

          {product.content && (
            <Reveal>
              <section id="details" className="rounded-2xl border border-border/50 bg-card/50 p-6">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                  Details
                </div>
                <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground prose-headings:text-foreground prose-p:text-muted-foreground">
                  {product.content}
                </div>
              </section>
            </Reveal>
          )}

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="border-t border-border/50 pt-12"
        >
          <h3 className="text-xl font-semibold mb-6">Related Projects</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProjects.map((related) => (
              <Link
                key={related.slug}
                href={`/projects/${related.slug}`}
                className="group block p-4 rounded-xl border border-border/50 bg-card/50 hover:border-primary/30 hover:shadow-md transition-all"
              >
                <div className="relative aspect-video rounded-lg overflow-hidden mb-3">
                  <Image
                    src={related.thumbnail}
                    alt={related.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                </div>
                <h4 className="font-semibold group-hover:text-primary transition-colors">
                  {related.title}
                </h4>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {related.description}
                </p>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
        </div>

        {/* Sticky rail */}
        <aside className="hidden xl:block">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-2xl border border-border/50 bg-card/50 p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Tech stack
              </div>
              {product.stack && product.stack.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {product.stack.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1.5 text-sm bg-muted rounded-lg text-foreground"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="mt-3 text-sm text-muted-foreground">Not specified.</div>
              )}
            </div>

            <div className="rounded-2xl border border-border/50 bg-card/50 p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                On this page
              </div>
              <nav className="mt-4 space-y-1 text-sm">
                {pageSections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="block rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                  >
                    {s.label}
                  </a>
                ))}
              </nav>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card/50 p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Links
              </div>
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
          </div>
        </aside>
      </div>
    </div>
  );
};
