"use client";

import { Product } from "@/types/products";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { EnhancedProjectCard } from "./EnhancedProjectCard";
import { cn } from "@/lib/utils";
import { Sparkles, Archive } from "lucide-react";

interface ProjectGridProps {
  projects: Product[];
  className?: string;
  showSectionHeaders?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

export function ProjectGrid({ projects, className, showSectionHeaders = true }: ProjectGridProps) {
  // Separate featured and regular projects, sorted by date
  const { featuredProjects, regularProjects } = useMemo(() => {
    const featured = [...projects]
      .filter((p) => p.featured)
      .sort((a, b) => {
        if (!a.startDate || !b.startDate) return 0;
        return b.startDate.localeCompare(a.startDate);
      });

    const regular = [...projects]
      .filter((p) => !p.featured)
      .sort((a, b) => {
        if (!a.startDate || !b.startDate) return 0;
        return b.startDate.localeCompare(a.startDate);
      });

    return { featuredProjects: featured, regularProjects: regular };
  }, [projects]);

  if (projects.length === 0) {
    return (
      <div className="text-center py-16 rounded-2xl border border-border/50 bg-card/50">
        <p className="text-lg text-muted-foreground">No projects found matching your filters.</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
      className={cn("space-y-12", className)}
    >
      {/* Featured Projects - Bento Layout */}
      {featuredProjects.length > 0 && (
        <section>
          {showSectionHeaders && (
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Featured Projects</h2>
              <span className="text-sm text-muted-foreground">({featuredProjects.length})</span>
            </div>
          )}

          {/* Bento Grid: First project large (2 cols), rest in 2-col grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.map((project, index) => (
              <motion.div
                key={project.slug}
                variants={itemVariants}
                className={cn(
                  // First project spans 2 columns on large screens
                  index === 0 && "md:col-span-2 lg:col-span-2",
                  // Make the first project row span for bento effect on desktop
                  index === 0 && "lg:row-span-1"
                )}
              >
                <EnhancedProjectCard
                  product={project}
                  variant={index === 0 ? "featured" : "default"}
                  showCaseStudyPreview={index === 0}
                />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Regular/Archived Projects */}
      {regularProjects.length > 0 && (
        <section>
          {showSectionHeaders && (
            <div className="flex items-center gap-2 mb-6">
              <Archive className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold text-muted-foreground">Other Projects</h2>
              <span className="text-sm text-muted-foreground">({regularProjects.length})</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {regularProjects.map((project) => (
              <motion.div key={project.slug} variants={itemVariants}>
                <EnhancedProjectCard product={project} variant="default" />
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}

// Compact grid variant for related projects
export function ProjectGridCompact({ projects, className }: ProjectGridProps) {
  if (projects.length === 0) return null;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
      className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", className)}
    >
      {projects.map((project) => (
        <motion.div key={project.slug} variants={itemVariants}>
          <EnhancedProjectCard product={project} variant="default" />
        </motion.div>
      ))}
    </motion.div>
  );
}
