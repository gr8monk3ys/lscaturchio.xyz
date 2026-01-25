"use client";

import { Product } from "@/types/products";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { EnhancedProjectCard } from "./EnhancedProjectCard";
import { cn } from "@/lib/utils";

interface ProjectGridProps {
  projects: Product[];
  className?: string;
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

export function ProjectGrid({ projects, className }: ProjectGridProps) {
  // Memoize sorted featured projects
  const sortedFeatured = useMemo(() => {
    return [...projects]
      .filter((p) => p.featured)
      .sort((a, b) => {
        if (!a.startDate || !b.startDate) return 0;
        return b.startDate.localeCompare(a.startDate);
      });
  }, [projects]);

  // Memoize sorted regular projects
  const sortedRegular = useMemo(() => {
    return [...projects]
      .filter((p) => !p.featured)
      .sort((a, b) => {
        if (!a.startDate || !b.startDate) return 0;
        return b.startDate.localeCompare(a.startDate);
      });
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
      className={cn("space-y-8", className)}
    >
      {/* Featured Projects - Bento Layout */}
      {sortedFeatured.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedFeatured.map((project) => (
            <motion.div
              key={project.slug}
              variants={itemVariants}
              className="md:col-span-2 lg:col-span-1"
            >
              <EnhancedProjectCard product={project} variant="featured" />
            </motion.div>
          ))}
        </div>
      )}

      {/* Regular Projects - Standard Grid */}
      {sortedRegular.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedRegular.map((project) => (
            <motion.div key={project.slug} variants={itemVariants}>
              <EnhancedProjectCard product={project} variant="default" />
            </motion.div>
          ))}
        </div>
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
