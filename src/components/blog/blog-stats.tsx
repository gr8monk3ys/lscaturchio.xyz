"use client";

import { useEffect, useState } from "react";
import { BookOpen, Clock, Tag, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { logError } from "@/lib/logger";

interface BlogStats {
  totalPosts: number;
  totalReadingTime: number;
  avgReadingTime: number;
  topTags: { tag: string; count: number }[];
}

/**
 * Blog statistics component
 * Displays aggregate statistics about the blog content
 */
export function BlogStats() {
  const [stats, setStats] = useState<BlogStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/blog-stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        logError("Failed to fetch blog stats", error, { component: "BlogStats" });
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8" aria-busy="true" aria-label="Loading blog statistics">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl neu-flat h-24"
            role="presentation"
          />
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      icon: BookOpen,
      label: "Total Posts",
      value: stats.totalPosts.toString(),
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      icon: Clock,
      label: "Total Reading",
      value: `${stats.totalReadingTime}min`,
      color: "text-green-600 dark:text-green-400",
    },
    {
      icon: TrendingUp,
      label: "Avg Reading",
      value: `${stats.avgReadingTime}min`,
      color: "text-purple-600 dark:text-purple-400",
    },
    {
      icon: Tag,
      label: "Top Tag",
      value: stats.topTags[0]?.tag || "N/A",
      color: "text-orange-600 dark:text-orange-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-2xl neu-card p-5"
          >
            <div className="flex items-center gap-3">
              <div
                className={`rounded-xl neu-flat-sm p-3 ${stat.color}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-lg font-bold truncate">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
