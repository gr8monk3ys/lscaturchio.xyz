"use client";

import { motion, useInView } from "framer-motion";
import { ArrowUpRight, Star, GitFork, Clock } from "lucide-react";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { Section, SectionHeader } from "../ui/Section";
import { useRef, useEffect, useState } from "react";
import { logError } from "@/lib/logger";
import { showContainerVariants, showItemVariants } from "@/lib/animations";
import Image from "next/image";
import type { PortfolioRepo } from "@/types/github";

function getInitials(title: string): string {
  return title
    .split(/[-\s_]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
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
  const [repositories, setRepositories] = useState<PortfolioRepo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        const response = await fetch('/api/github');
        if (!response.ok) {
          throw new Error('Failed to fetch repositories');
        }
        const data: PortfolioRepo[] = await response.json();
        const sortedRepos = data.sort((a: PortfolioRepo, b: PortfolioRepo) =>
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
    <Section padding="default" size="wide" divider topDivider>
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
          className="grid grid-cols-1 gap-6 md:grid-cols-6"
        >
          {loading ? (
            [...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                variants={showItemVariants}
                className="h-[260px] animate-pulse rounded-2xl bg-muted/50 md:col-span-2"
              />
            ))
          ) : (
            repositories.map((repo, index) => (
              <motion.div
                key={repo.href}
                variants={showItemVariants}
                className={`group relative overflow-hidden rounded-2xl border border-border/60 bg-background/95 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl ${
                  index === 2 ? "md:col-span-6" : "md:col-span-3"
                }`}
              >
                <div className="relative flex h-36 items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950/70 to-slate-900">
                  <ProjectLogo logo={repo.logo} title={repo.title} />
                  <div className="absolute right-4 top-4 flex size-11 items-center justify-center rounded-2xl border border-white/20 bg-gradient-to-br from-indigo-500/70 to-violet-500/70 text-sm font-semibold text-white backdrop-blur-md">
                    {getInitials(repo.title)}
                  </div>
                </div>

                <div className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="truncate font-semibold transition-colors group-hover:text-primary">
                      {repo.title}
                    </h3>
                    <Link
                      href={repo.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20"
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

function ProjectLogo({ logo, title }: { logo: string; title: string }) {
  const [src, setSrc] = useState(logo);

  return (
    <Image
      src={src}
      alt={`${title} logo`}
      width={180}
      height={112}
      unoptimized
      className="max-h-24 w-auto rounded-xl border border-white/10 object-contain p-2"
      onError={() => setSrc("/images/projects/logos/default.svg")}
    />
  );
}
