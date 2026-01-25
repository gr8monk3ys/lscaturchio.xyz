"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { products } from "@/constants/products";
import { cn } from "@/lib/utils";

interface TechStackVizProps {
  className?: string;
  onTechSelect?: (tech: string) => void;
}

interface TechCount {
  name: string;
  count: number;
}

export function TechStackViz({ className, onTechSelect }: TechStackVizProps) {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTech = searchParams?.get("tech") || "";

  // Aggregate technologies with counts
  const techCounts = useMemo((): TechCount[] => {
    const counts: Record<string, number> = {};
    products.forEach((product) => {
      product.stack?.forEach((tech) => {
        counts[tech] = (counts[tech] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, []);

  const maxCount = Math.max(...techCounts.map((t) => t.count));

  const handleTechClick = (tech: string) => {
    if (onTechSelect) {
      onTechSelect(tech);
    } else {
      const params = new URLSearchParams(searchParams?.toString() || "");
      if (currentTech === tech) {
        params.delete("tech");
      } else {
        params.set("tech", tech);
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    show: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 20,
      },
    },
  };

  return (
    <section className={cn("py-8", className)} ref={containerRef}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold">Technologies</h2>
          <p className="text-sm text-muted-foreground">Click to filter by technology</p>
        </div>
        {currentTech && (
          <motion.button
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => handleTechClick(currentTech)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear filter
          </motion.button>
        )}
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "show" : "hidden"}
        className="flex flex-wrap gap-2"
      >
        {techCounts.map((tech) => {
          const isActive = currentTech === tech.name;
          const intensity = tech.count / maxCount;

          return (
            <motion.button
              key={tech.name}
              variants={itemVariants}
              onClick={() => handleTechClick(tech.name)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "relative px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                "border border-border/50",
                isActive
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card/50 hover:bg-muted hover:border-primary/30"
              )}
              style={{
                opacity: isActive ? 1 : 0.6 + intensity * 0.4,
              }}
            >
              <span>{tech.name}</span>
              <span
                className={cn(
                  "ml-1.5 text-xs",
                  isActive ? "text-primary-foreground/70" : "text-muted-foreground"
                )}
              >
                ({tech.count})
              </span>
            </motion.button>
          );
        })}
      </motion.div>
    </section>
  );
}

// Compact version for use in detail pages
export function TechStackCompact({
  stack,
  className,
}: {
  stack: string[];
  className?: string;
}) {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true });

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      className={cn("flex flex-wrap gap-2", className)}
    >
      {stack.map((tech, index) => (
        <motion.span
          key={tech}
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: index * 0.05 }}
          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-primary/10 text-primary border border-primary/20"
        >
          {tech}
        </motion.span>
      ))}
    </motion.div>
  );
}
