"use client";

import { motion, useInView } from "framer-motion";
import { ArrowUpRight, Layers } from "lucide-react";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { useRef } from "react";
import { products } from "@/constants/products";
import Image from "next/image";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function RecentProjects() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const recentProjects = products.slice(0, 3);

  return (
    <section ref={containerRef} className="py-16">
      <div className="container px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Recent Projects</h2>
          <Link 
            href="/projects"
            className="group inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            View all projects
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {recentProjects.map((project) => (
            <motion.div
              key={project.slug}
              variants={itemVariants}
              className="group relative flex flex-col overflow-hidden rounded-xl bg-secondary/50 transition-all hover:bg-secondary/70"
            >
              <Link href={project.href} className="flex flex-col flex-1 p-6" target="_blank" rel="noopener noreferrer">
                <div className="relative h-40 w-full mb-4 overflow-hidden rounded-lg">
                  <Image
                    src={project.thumbnail}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Layers className="size-4" />
                  <span>{project.stack.slice(0, 2).join(", ")}</span>
                </div>

                <h3 className="text-lg font-semibold tracking-tight mb-2">
                  {project.title}
                </h3>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {project.description}
                </p>

                <div className="mt-auto flex flex-wrap gap-1.5">
                  {project.stack.map((tech) => (
                    <Badge
                      key={tech}
                      variant="secondary"
                      className="px-2 py-0.5 text-xs font-medium"
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm font-medium">
                  View project
                  <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
