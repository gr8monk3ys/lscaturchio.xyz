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
      className="group relative w-full bg-secondary/50 hover:bg-secondary/70 rounded-xl overflow-hidden flex flex-col h-full border border-transparent hover:border-primary/20"
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
                className="text-lg font-semibold tracking-tight"
              >
                {repository.title}
              </motion.h3>
              <p className="text-muted-foreground text-sm line-clamp-2">
                {repository.description}
              </p>
            </div>
            <Link
              href={repository.href}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 size-8 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
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
                  className="transition-colors group-hover:bg-primary/10 group-hover:text-primary"
                >
                  {tech}
                </Badge>
              ))}
            </motion.div>
          )}

          {repository.content && (
            <p className="text-sm text-muted-foreground mt-auto group-hover:text-primary/80 transition-colors">
              {repository.content}
            </p>
          )}

          <div className="flex items-center gap-4 mt-auto">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground group-hover:text-primary/80 transition-colors">
              <Star className="size-4" />
              <span>{repository.stars}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground group-hover:text-primary/80 transition-colors">
              <GitFork className="size-4" />
              <span>{repository.forks}</span>
            </div>
            <div className="text-sm text-muted-foreground group-hover:text-primary/80 transition-colors ml-auto">
              {repository.lastUpdated}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
