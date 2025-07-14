"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, Star, GitFork } from "lucide-react";
import { Badge } from "./badge";

interface Repository {
  title: string;
  description: string;
  href: string;
  slug: string;
  stack?: string[];
  content?: React.ReactNode | string;
  stars: number;
  forks: number;
  lastUpdated: string;
}

export const RepositoryCard = ({ repository }: { repository: Repository }) => {
  return (
    <motion.div
      className="group relative w-full bg-stone-50 dark:bg-stone-800 rounded-xl overflow-hidden flex flex-col h-full neu-card shadow-[2px_2px_4px_rgba(0,0,0,0.1),-2px_-2px_4px_rgba(255,255,255,0.7)] dark:shadow-[2px_2px_4px_rgba(0,0,0,0.3),-1px_-1px_3px_rgba(255,255,255,0.05)] hover:shadow-[1px_1px_2px_rgba(0,0,0,0.05),-1px_-1px_2px_rgba(255,255,255,0.6)] dark:hover:shadow-[1px_1px_2px_rgba(0,0,0,0.2),-0.5px_-0.5px_1px_rgba(255,255,255,0.03)]"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -5,
        transition: { 
          duration: 0.2,
          ease: "easeOut"
        }
      }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex flex-col gap-3 h-full">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <motion.h3 
                className="text-lg font-space-mono font-semibold tracking-tight"
              >
                {repository.title}
              </motion.h3>
              <p className="text-muted-foreground font-space-mono text-sm line-clamp-2">
                {repository.description}
              </p>
            </div>
            <Link
              href={repository.href}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 size-8 flex items-center justify-center rounded-full bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-200 shadow-[2px_2px_4px_rgba(0,0,0,0.05),-2px_-2px_4px_rgba(255,255,255,0.6)] dark:shadow-[2px_2px_4px_rgba(0,0,0,0.2),-1px_-1px_3px_rgba(255,255,255,0.04)] hover:shadow-[1px_1px_2px_rgba(0,0,0,0.05),-1px_-1px_2px_rgba(255,255,255,0.6)] dark:hover:shadow-[1px_1px_2px_rgba(0,0,0,0.2),-0.5px_-0.5px_1px_rgba(255,255,255,0.03)] hover:bg-stone-200 dark:hover:bg-stone-600 transition-all"
            >
              <motion.div
                whileHover={{ 
                  rotate: 45,
                  transition: { duration: 0.2 }
                }}
              >
                <ArrowUpRight className="size-4" />
              </motion.div>
            </Link>
          </div>

          {repository.stack && repository.stack.length > 0 && (
            <motion.div 
              className="flex flex-wrap gap-1"
            >
              {repository.stack.map((tech) => (
                <Badge 
                  key={tech} 
                  variant="secondary"
                  className="transition-all font-space-mono bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 shadow-[1px_1px_2px_rgba(0,0,0,0.05),-1px_-1px_2px_rgba(255,255,255,0.6)] dark:shadow-[1px_1px_2px_rgba(0,0,0,0.2),-1px_-1px_2px_rgba(255,255,255,0.04)] group-hover:shadow-[0px_0px_1px_rgba(0,0,0,0.05),0px_0px_1px_rgba(255,255,255,0.6)] group-hover:bg-stone-200 dark:group-hover:bg-stone-600 group-hover:text-stone-900 dark:group-hover:text-stone-100"
                >
                  {tech}
                </Badge>
              ))}
            </motion.div>
          )}

          {repository.content && (
            <p className="text-sm font-space-mono text-muted-foreground mt-auto group-hover:text-stone-800 dark:group-hover:text-stone-200 transition-colors">
              {repository.content}
            </p>
          )}

          <div className="flex items-center gap-4 mt-auto">
            <div className="flex items-center gap-1.5 text-sm font-space-mono text-muted-foreground group-hover:text-stone-800 dark:group-hover:text-stone-200 transition-colors">
              <Star className="size-4" />
              <span>{repository.stars}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-space-mono text-muted-foreground group-hover:text-stone-800 dark:group-hover:text-stone-200 transition-colors">
              <GitFork className="size-4" />
              <span>{repository.forks}</span>
            </div>
            <div className="text-sm font-space-mono text-muted-foreground group-hover:text-stone-800 dark:group-hover:text-stone-200 transition-colors ml-auto">
              {repository.lastUpdated}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
