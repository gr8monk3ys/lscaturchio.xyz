"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RepositoryCard } from "@/components/ui/repository-card";

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

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const Products = () => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        const response = await fetch('/api/github');
        if (!response.ok) {
          throw new Error('Failed to fetch repositories');
        }
        const data = await response.json();
        setRepositories(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch repositories');
      } finally {
        setLoading(false);
      }
    };

    fetchRepositories();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-stone-800 dark:border-stone-300 shadow-[1px_1px_2px_rgba(0,0,0,0.05),-1px_-1px_2px_rgba(255,255,255,0.6)] dark:shadow-[1px_1px_2px_rgba(0,0,0,0.2),-0.5px_-0.5px_1px_rgba(255,255,255,0.03)]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center font-space-mono p-4 rounded-lg text-red-500 bg-stone-100/50 dark:bg-stone-800/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05),inset_0_-2px_4px_rgba(255,255,255,0.7)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2),inset_0_-1px_2px_rgba(255,255,255,0.05)]">
        Error: {error}
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4"
    >
      {repositories.map((repo) => (
        <RepositoryCard key={repo.href} repository={repo} />
      ))}
    </motion.div>
  );
};
