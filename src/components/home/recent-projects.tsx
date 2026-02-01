"use client";

import { motion, useInView } from "framer-motion";
import { ArrowUpRight, Star, GitFork, Clock } from "lucide-react";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { Section, SectionHeader } from "../ui/Section";
import { useRef, useEffect, useState } from "react";
import { logError } from "@/lib/logger";
import { showContainerVariants, showItemVariants } from "@/lib/animations";

interface Repository {
  title: string;
  description: string;
  href: string;
  slug: string;
  stack?: string[];
  stars: number;
  forks: number;
  lastUpdated: string;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  } else {
    return date.toLocaleDateString();
  }
}

export function RecentProjects() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        const response = await fetch('/api/github');
        if (!response.ok) {
          throw new Error('Failed to fetch repositories');
        }
        const data = await response.json();
        const sortedRepos = data.sort((a: Repository, b: Repository) =>
          new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
        );
        setRepositories(sortedRepos.slice(0, 3));
      } catch (error) {
        logError('Failed to fetch GitHub repositories', error, { component: 'RecentProjects', action: 'fetchRepositories' });
      } finally {
        setLoading(false);
      }
    };

    fetchRepositories();
  }, []);

  return (
    <Section padding="default" size="wide" divider>
      <div ref={containerRef}>
        <SectionHeader
          title="Recent Updates"
          action={
            <Link
              href="/projects"
              className="group inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              View all projects
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          }
        />

        <motion.div
          variants={showContainerVariants}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {loading ? (
            [...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                variants={showItemVariants}
                className="bg-secondary/50 rounded-xl p-4 h-[200px] animate-pulse"
              />
            ))
          ) : (
            repositories.map((repo) => (
              <motion.div
                key={repo.href}
                variants={showItemVariants}
                className="group relative bg-secondary/50 hover:bg-secondary/70 rounded-xl p-5 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                      {repo.title}
                    </h3>
                    <Link
                      href={repo.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 size-8 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      <ArrowUpRight className="size-4" />
                    </Link>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {repo.description}
                  </p>
                  {repo.stack && repo.stack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {repo.stack.slice(0, 3).map((tech) => (
                        <Badge
                          key={tech}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Star className="size-4" />
                        <span>{repo.stars}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <GitFork className="size-4" />
                        <span>{repo.forks}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="size-4" />
                      <span>{formatTimeAgo(repo.lastUpdated)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </Section>
  );
}
