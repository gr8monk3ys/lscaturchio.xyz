"use client";

import { Product, ProjectStatus } from "@/types/products";
import { motion, useScroll, useTransform } from '@/lib/motion';
import { useRef, useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Calendar, ExternalLink, Github, Star } from "lucide-react";

interface ProjectTimelineProps {
  projects: Product[];
  className?: string;
}

const statusColors: Record<ProjectStatus, string> = {
  active: "bg-green-500",
  maintained: "bg-yellow-500",
  archived: "bg-gray-500",
};

export function ProjectTimeline({ projects, className }: ProjectTimelineProps) {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  // Group projects by year
  const projectsByYear = useMemo(() => {
    const grouped: Record<string, Product[]> = {};

    const sortedProjects = [...projects].sort((a, b) => {
      if (!a.startDate || !b.startDate) return 0;
      return b.startDate.localeCompare(a.startDate);
    });

    sortedProjects.forEach((project) => {
      const year = project.startDate
        ? new Date(project.startDate + "-01").getFullYear().toString()
        : "Unknown";
      if (!grouped[year]) {
        grouped[year] = [];
      }
      grouped[year].push(project);
    });

    return grouped;
  }, [projects]);

  const years = Object.keys(projectsByYear).sort((a, b) => {
    if (a === "Unknown") return 1;
    if (b === "Unknown") return -1;
    return parseInt(b) - parseInt(a);
  });

  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setHeight(entry.contentRect.height);
      }
    });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  if (projects.length === 0) {
    return (
      <div className="text-center py-16 rounded-2xl border border-border/50 bg-card/50">
        <p className="text-lg text-muted-foreground">No projects found matching your filters.</p>
      </div>
    );
  }

  return (
    <div
      className={cn("w-full bg-background font-sans md:px-10 rounded-xl", className)}
      ref={containerRef}
    >
      <div ref={ref} className="relative max-w-7xl mx-auto pb-20">
        {years.map((year) => (
          <div key={year} className="mb-12">
            {/* Year Header */}
            <div className="sticky top-20 z-30 flex items-center pt-10 md:pt-16 mb-8">
              <div className="h-10 absolute left-3 md:left-3 w-10 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-primary" />
              </div>
              <h3 className="ml-16 md:ml-16 text-3xl md:text-4xl font-bold text-primary">
                {year}
              </h3>
            </div>

            {/* Projects for this year */}
            <div className="space-y-8 pl-16 md:pl-20">
              {projectsByYear[year].map((project, index) => (
                <motion.div
                  key={project.slug}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="group relative"
                >
                  {/* Timeline dot */}
                  <div className="absolute -left-[52px] md:-left-[60px] top-6 flex items-center justify-center">
                    <div
                      className={cn(
                        "h-4 w-4 rounded-full border-2 border-background",
                        statusColors[project.status || "active"]
                      )}
                    />
                  </div>

                  {/* Card */}
                  <Link href={`/projects/${project.slug}`}>
                    <div
                      className={cn(
                        "relative overflow-hidden rounded-xl border border-border/50",
                        "bg-card/50 backdrop-blur-sm",
                        "transition-all duration-300",
                        "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                      )}
                    >
                      <div className="flex flex-col md:flex-row">
                        {/* Image */}
                        <div className="relative w-full md:w-48 h-32 md:h-auto flex-shrink-0">
                          <Image
                            src={project.thumbnail}
                            alt={project.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 200px"
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-4 md:p-5 space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            {project.featured && (
                              <Star className="h-4 w-4 text-primary fill-primary" />
                            )}
                            {project.startDate && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {new Date(project.startDate + "-01").toLocaleDateString("en-US", {
                                  month: "short",
                                  year: "numeric",
                                })}
                              </div>
                            )}
                            <Badge
                              variant="secondary"
                              className={cn(
                                "text-xs",
                                project.status === "active" && "text-green-600 bg-green-500/10",
                                project.status === "maintained" && "text-yellow-600 bg-yellow-500/10",
                                project.status === "archived" && "text-gray-600 bg-gray-500/10"
                              )}
                            >
                              {project.status}
                            </Badge>
                          </div>

                          <h4 className="font-semibold text-lg group-hover:text-primary transition-colors">
                            {project.title}
                          </h4>

                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {project.description}
                          </p>

                          {/* Tech Stack */}
                          {project.stack && (
                            <div className="flex flex-wrap gap-1">
                              {project.stack.slice(0, 4).map((tech) => (
                                <span
                                  key={tech}
                                  className="px-2 py-0.5 text-xs bg-muted rounded text-muted-foreground"
                                >
                                  {tech}
                                </span>
                              ))}
                              {project.stack.length > 4 && (
                                <span className="px-2 py-0.5 text-xs bg-muted rounded text-muted-foreground">
                                  +{project.stack.length - 4}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Links */}
                          <div className="flex items-center gap-2 pt-1">
                            {project.sourceUrl && (
                              <a
                                href={project.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="p-1.5 rounded-md hover:bg-muted transition-colors"
                                aria-label={`View ${project.title} source on GitHub`}
                              >
                                <Github className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                              </a>
                            )}
                            {(project.demoUrl || project.href) && (
                              <a
                                href={project.demoUrl || project.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="p-1.5 rounded-md hover:bg-muted transition-colors"
                                aria-label={`View ${project.title} live demo`}
                              >
                                <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        ))}

        {/* Timeline Line */}
        <div
          style={{
            height: height + "px",
          }}
          className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-border to-transparent to-[99%] [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0 w-[2px] bg-gradient-to-t from-primary via-primary/50 to-transparent from-[0%] via-[10%] rounded-full"
          />
        </div>
      </div>
    </div>
  );
}
