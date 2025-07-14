"use client";

import { motion, useInView } from "framer-motion";
import { ArrowUpRight, Star, GitFork, Clock } from "lucide-react";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { useRef, useEffect, useState } from "react";

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
        // Sort by lastUpdated date (most recent first)
        const sortedRepos = data.sort((a: Repository, b: Repository) => 
          new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
        );
        setRepositories(sortedRepos.slice(0, 3)); // Get only the 3 most recently updated repos
      } catch (err) {
        console.error('Failed to fetch repositories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRepositories();
  }, []);

  return (
    <section ref={containerRef} className="py-16">
      <div className="container px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Recent Updates</h2>
          <Link 
            href="/projects"
            className="group inline-flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 shadow-[1px_1px_2px_rgba(0,0,0,0.05),-1px_-1px_2px_rgba(255,255,255,0.6)] dark:shadow-[1px_1px_2px_rgba(0,0,0,0.2),-0.5px_-0.5px_1px_rgba(255,255,255,0.03)] hover:shadow-[0.5px_0.5px_1px_rgba(0,0,0,0.05),-0.5px_-0.5px_1px_rgba(255,255,255,0.7)] dark:hover:shadow-[0.5px_0.5px_1px_rgba(0,0,0,0.2),-0.25px_-0.25px_0.5px_rgba(255,255,255,0.04)] transition-all hover:translate-y-[-1px]"
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
          {loading ? (
            // Show loading skeletons for 3 cards
            [...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="neu-card bg-stone-50 dark:bg-stone-800 rounded-lg p-4 h-[200px] animate-pulse"
              />
            ))
          ) : (
            repositories.map((repo) => (
              <motion.div
                key={repo.href}
                variants={itemVariants}
                className="group relative neu-card bg-stone-50 dark:bg-stone-800 hover:shadow-[2px_2px_5px_rgba(0,0,0,0.08),-2px_-2px_5px_rgba(255,255,255,0.8)] dark:hover:shadow-[2px_2px_5px_rgba(0,0,0,0.3),-2px_-2px_5px_rgba(255,255,255,0.05)] rounded-lg p-5 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold truncate">{repo.title}</h3>
                    <Link
                      href={repo.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 size-8 flex items-center justify-center rounded-full bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-200 shadow-[2px_2px_4px_rgba(0,0,0,0.05),-2px_-2px_4px_rgba(255,255,255,0.6)] dark:shadow-[2px_2px_4px_rgba(0,0,0,0.2),-2px_-2px_4px_rgba(255,255,255,0.04)] hover:shadow-[1px_1px_2px_rgba(0,0,0,0.05),-1px_-1px_2px_rgba(255,255,255,0.6)] dark:hover:shadow-[1px_1px_2px_rgba(0,0,0,0.2),-1px_-1px_2px_rgba(255,255,255,0.04)] hover:bg-stone-200 dark:hover:bg-stone-600 transition-all"
                    >
                      <ArrowUpRight className="size-4" />
                    </Link>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {repo.description}
                  </p>
                  {repo.stack && repo.stack.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-2">
                      {repo.stack.map((tech) => (
                        <Badge 
                          key={tech} 
                          variant="secondary"
                          className="transition-all bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 shadow-[1px_1px_2px_rgba(0,0,0,0.05),-1px_-1px_2px_rgba(255,255,255,0.6)] dark:shadow-[1px_1px_2px_rgba(0,0,0,0.2),-1px_-1px_2px_rgba(255,255,255,0.04)] group-hover:shadow-[0px_0px_1px_rgba(0,0,0,0.05),0px_0px_1px_rgba(255,255,255,0.6)] group-hover:bg-stone-200 dark:group-hover:bg-stone-600 group-hover:text-stone-900 dark:group-hover:text-stone-100"
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground group-hover:text-primary/80 transition-colors">
                        <Star className="size-4" />
                        <span>{repo.stars}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground group-hover:text-primary/80 transition-colors">
                        <GitFork className="size-4" />
                        <span>{repo.forks}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground group-hover:text-primary/80 transition-colors">
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
    </section>
  );
}
