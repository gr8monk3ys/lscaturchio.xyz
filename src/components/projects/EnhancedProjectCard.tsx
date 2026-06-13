"use client";

import { Product, ProjectStatus, ProjectCategory } from "@/types/products";
import Image from "next/image";
import Link from "next/link";
import { m, useMotionPreset, useReducedMotion } from '@/lib/motion';
import { TiltCard } from "@/components/ui/animated-card";
import { Star, ExternalLink, Github, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface EnhancedProjectCardProps {
  product: Product;
  variant?: "featured" | "default";
  className?: string;
  showCaseStudyPreview?: boolean;
}

const statusColors: Record<ProjectStatus, { bg: string; text: string; label: string }> = {
  active: { bg: "bg-green-500/10", text: "text-green-500", label: "Active" },
  maintained: { bg: "bg-yellow-500/10", text: "text-yellow-500", label: "Maintained" },
  archived: { bg: "bg-gray-500/10", text: "text-gray-500", label: "Archived" },
};

const categoryLabels: Record<ProjectCategory, string> = {
  "ai-ml": "AI/ML",
  "web-apps": "Web Apps",
  "tools": "Tools",
  "open-source": "Open Source",
  "data-science": "Data Science",
};

export function EnhancedProjectCard({
  product,
  variant = "default",
  className,
  showCaseStudyPreview = false,
}: EnhancedProjectCardProps) {
  const isFeatured = variant === "featured" || product.featured;
  const status = product.status || "active";
  const statusConfig = statusColors[status];
  const reduceMotion = useReducedMotion();
  const shared = !reduceMotion && !!product.slug;
  const fastTransition = useMotionPreset('fast');

  const CardWrapper = isFeatured ? TiltCard : m.div;
  const cardProps = isFeatured
    ? { tiltAmount: 8, scale: 1.02, glareOpacity: 0.05 }
    : { whileHover: { y: -4, transition: fastTransition } };

  return (
    <CardWrapper
      {...cardProps}
      className={cn(
        "group relative h-full",
        isFeatured && "col-span-2",
        className
      )}
    >
      <div
        className={cn(
          "relative h-full overflow-hidden border border-border",
          "transition-colors duration-200",
          "hover:border-primary/45"
        )}
      >
        {/* Featured Star */}
        {product.featured && (
          <div className="absolute top-3 right-3 z-10">
            <div className="p-1.5 rounded-full bg-primary/20 backdrop-blur-xs">
              <Star className="h-4 w-4 text-primary fill-primary" />
            </div>
          </div>
        )}

        {/* Image Section */}
        <Link href={`/projects/${product.slug}`} className="block">
          <m.div
            layoutId={shared ? `project-cover-${product.slug}` : undefined}
            className={cn(
              "relative overflow-hidden",
              isFeatured ? "aspect-2/1" : "aspect-video"
            )}
          >
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes={isFeatured ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
            />
            <div className="absolute inset-0 bg-linear-to-t from-background/90 via-background/20 to-transparent" />
          </m.div>
        </Link>

        {/* Content Section */}
        <div className="relative p-5 space-y-4">
          {/* Status & categories — single mono wall-label line. */}
          <div className="label-mono flex items-center gap-2">
            <span className={cn("h-1.5 w-1.5 rounded-full", statusConfig.text.replace("text-", "bg-"))} />
            <span>
              {[statusConfig.label, ...(product.categories?.slice(0, 2).map((c) => categoryLabels[c]) ?? [])].join("  ·  ")}
            </span>
          </div>

          {/* Title & Description */}
          <Link href={`/projects/${product.slug}`} className="block space-y-2">
            <m.div layoutId={shared ? `project-title-${product.slug}` : undefined}>
              <h3
                className={cn(
                  "font-bold tracking-tight transition-colors group-hover:text-primary",
                  isFeatured ? "text-xl md:text-2xl" : "text-lg"
                )}
              >
                {product.title}
              </h3>
            </m.div>
            <p
              className={cn(
                "text-muted-foreground leading-relaxed",
                isFeatured ? "text-sm line-clamp-3" : "text-sm line-clamp-2"
              )}
            >
              {product.description}
            </p>
          </Link>

          {/* Case Study Preview - Only for featured cards */}
          {showCaseStudyPreview && product.caseStudy && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 space-y-2">
              <p className="text-xs font-medium text-primary uppercase tracking-wide">
                Case Study
              </p>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {product.caseStudy.challenge}
              </p>
              {product.caseStudy.results && product.caseStudy.results.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {product.caseStudy.results.slice(0, 2).map((result) => (
                    <span
                      key={result}
                      className="label-mono normal-case tracking-normal text-primary"
                    >
                      {result}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tech stack — mono middot line. */}
          {product.stack && product.stack.length > 0 && (
            <p className="label-mono normal-case tracking-normal text-muted-foreground">
              {product.stack.slice(0, isFeatured ? 5 : 3).join("  ·  ")}
              {product.stack.length > (isFeatured ? 5 : 3) &&
                `  ·  +${product.stack.length - (isFeatured ? 5 : 3)}`}
            </p>
          )}

          {/* Start Date */}
          {product.startDate && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                {new Date(product.startDate + "-01").toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            {product.demoUrl && (
              <a
                href={product.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium",
                  "bg-primary text-primary-foreground",
                  "hover:bg-primary/90 transition-colors"
                )}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Demo
              </a>
            )}
            {product.sourceUrl && (
              <a
                href={product.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium",
                  "bg-muted text-muted-foreground",
                  "hover:bg-muted/80 hover:text-foreground transition-colors"
                )}
              >
                <Github className="h-3.5 w-3.5" />
                Source
              </a>
            )}
            {!product.demoUrl && !product.sourceUrl && product.href && (
              <a
                href={product.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium",
                  "bg-primary text-primary-foreground",
                  "hover:bg-primary/90 transition-colors"
                )}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View Project
              </a>
            )}
          </div>
        </div>
      </div>
    </CardWrapper>
  );
}
