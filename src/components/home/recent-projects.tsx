"use client";

import { ArrowUpRight, Star, GitFork, Clock } from "lucide-react";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { Section, SectionHeader } from "../ui/Section";
import Image from "next/image";
import type { PortfolioRepo } from "@/types/github";
import { Reveal } from "@/components/motion/reveal";

function getInitials(title: string): string {
  return title
    .split(/[-\s_]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

function getRepoCover(repoName: string): string {
  return `https://opengraph.githubassets.com/1/gr8monk3ys/${repoName}`;
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

interface RecentProjectsProps {
  repos: PortfolioRepo[];
}

export function RecentProjects({ repos }: RecentProjectsProps) {
  // Sort by most recently updated and take top 3
  const repositories = [...repos]
    .sort(
      (a, b) =>
        new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    )
    .slice(0, 3);

  return (
    <Section padding="default" size="wide" divider topDivider reveal={false}>
      <div>
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

        <div className="grid grid-cols-1 gap-6 md:grid-cols-6">
          {repositories.length === 0 ? (
            [...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-[260px] animate-pulse rounded-2xl bg-muted/50 md:col-span-2"
              />
            ))
          ) : (
            repositories.map((repo, index) => (
              <Reveal
                key={repo.href}
                delayMs={index * 80}
                className={index === 1 ? "md:col-span-4" : "md:col-span-2"}
              >
                <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-background/95 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative h-36 overflow-hidden">
                    <Image
                      src={getRepoCover(repo.title)}
                      alt={`${repo.title} repository cover`}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
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
                          <Badge key={tech} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Star className="size-4" />
                          <span className="tabular-nums">{repo.stars}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <GitFork className="size-4" />
                          <span className="tabular-nums">{repo.forks}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="size-4" />
                        <span>{formatTimeAgo(repo.lastUpdated)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))
          )}
        </div>
      </div>
    </Section>
  );
}
