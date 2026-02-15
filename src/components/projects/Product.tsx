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

  return (
    <div className="py-10 max-w-5xl mx-auto">
      {/* Back Navigation */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
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

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        {/* Status & Categories */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
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

        {/* Title & Description */}
        <motion.div layoutId={shared ? `project-title-${product.slug}` : undefined}>
          <Heading className="font-bold text-3xl md:text-4xl mb-4">{product.title}</Heading>
        </motion.div>
        <Paragraph className="text-lg text-muted-foreground">{product.description}</Paragraph>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-6">
          {product.demoUrl && (
            <a
              href={product.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors"
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
              className="inline-flex items-center gap-2 bg-muted text-foreground px-5 py-2.5 rounded-lg font-medium hover:bg-muted/80 transition-colors"
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
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              View Project
            </a>
          )}
        </div>
      </motion.div>

      {/* Hero Image */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8"
      >
        <motion.div
          layoutId={shared ? `project-cover-${product.slug}` : undefined}
          className="relative aspect-video rounded-xl overflow-hidden border border-border/50"
        >
          <Image
            src={activeImage}
            alt={`${product.title} project screenshot`}
            fill
            className="object-contain bg-muted/30"
            sizes="(max-width: 768px) 100vw, 80vw"
          />
        </motion.div>

        {/* Image Thumbnails */}
        {product.images.length > 1 && (
          <div className="flex flex-row justify-center my-4 flex-wrap gap-2">
            {product.images.map((image, idx) => (
              <button
                onClick={() => setActiveImage(image)}
                key={`image-thumbnail-${idx}`}
                className={cn(
                  "relative rounded-lg overflow-hidden border-2 transition-all",
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

      {/* Two Column Layout: Tech Stack + Case Study/Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12"
      >
        {/* Sidebar: Tech Stack */}
        <div className="lg:col-span-1 space-y-6">
          {/* Tech Stack */}
          {product.stack && product.stack.length > 0 && (
            <div className="p-5 rounded-xl border border-border/50 bg-card/50">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                Tech Stack
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.stack.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1.5 text-sm bg-muted rounded-lg text-foreground"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content: Case Study or Description */}
        <div className="lg:col-span-2 space-y-8">
          {/* Case Study Section */}
          {product.caseStudy && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Case Study</h3>

              {/* Challenge */}
              <div className="p-5 rounded-xl border border-border/50 bg-card/50">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-5 w-5 text-orange-500" />
                  <h4 className="font-semibold">The Challenge</h4>
                </div>
                <p className="text-muted-foreground">{product.caseStudy.challenge}</p>
              </div>

              {/* Solution */}
              <div className="p-5 rounded-xl border border-border/50 bg-card/50">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  <h4 className="font-semibold">The Solution</h4>
                </div>
                <p className="text-muted-foreground">{product.caseStudy.solution}</p>
              </div>

              {/* Results */}
              {product.caseStudy.results && product.caseStudy.results.length > 0 && (
                <div className="p-5 rounded-xl border border-primary/20 bg-primary/5">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Results & Impact</h4>
                  </div>
                  <ul className="space-y-2">
                    {product.caseStudy.results.map((result, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span className="text-foreground">{result}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Original Content */}
          {product.content && (
            <div>
              {product.caseStudy && (
                <h3 className="text-xl font-semibold mb-4">Details</h3>
              )}
              <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground prose-headings:text-foreground prose-p:text-muted-foreground">
                {product.content}
              </div>
            </div>
          )}
        </div>
      </motion.div>

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
  );
};
