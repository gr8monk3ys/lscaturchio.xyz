"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Code2, RefreshCw, Clock, Calendar } from "lucide-react";
import { AnimatedCounter, SkillBar } from "@/components/ui/animated-counter";
import { logError } from "@/lib/logger";
import type { WakaTimeStats } from "@/lib/wakatime";
import { getLanguageColor } from "@/lib/wakatime";

interface CodingStatsProps {
  className?: string;
  showProjects?: boolean;
  showEditors?: boolean;
  showRefresh?: boolean;
  maxLanguages?: number;
}

interface StatsResponse {
  data: WakaTimeStats;
  isMock: boolean;
  error?: string;
}

export function CodingStats({
  className = "",
  showProjects = false,
  showEditors = false,
  showRefresh = true,
  maxLanguages = 5,
}: CodingStatsProps) {
  const [stats, setStats] = useState<WakaTimeStats | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch("/api/wakatime/stats");
      const data: StatsResponse = await response.json();
      setStats(data.data);
      setIsMock(data.isMock);
    } catch (error) {
      logError("Failed to fetch coding stats", error, {
        component: "CodingStats",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchStats();
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div
        className={`p-6 rounded-lg border border-gray-200 dark:border-gray-800 ${className}`}
      >
        <div className="flex items-center gap-2 mb-6">
          <Code2 className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold">Coding This Week</h3>
        </div>
        <div className="space-y-4">
          <div className="h-12 bg-muted animate-pulse rounded" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded w-24" />
                <div className="h-2 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const totalHours = stats.total_seconds / 3600;

  return (
    <motion.div
      className={`p-6 rounded-lg border border-gray-200 dark:border-gray-800 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Code2 className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold">Coding This Week</h3>
          {isMock && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              Demo
            </span>
          )}
        </div>
        {showRefresh && (
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-md hover:bg-muted transition-colors disabled:opacity-50"
            aria-label="Refresh stats"
          >
            <RefreshCw
              className={`h-4 w-4 text-muted-foreground ${
                isRefreshing ? "animate-spin" : ""
              }`}
            />
          </button>
        )}
      </div>

      {/* Total Time */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold tracking-tight">
            <AnimatedCounter
              value={totalHours}
              decimals={1}
              duration={2}
            />
          </span>
          <span className="text-xl text-muted-foreground">hours</span>
        </div>
        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>Avg: {stats.human_readable_daily_average}/day</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{stats.range.text}</span>
          </div>
        </div>
      </div>

      {/* Languages */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Languages
        </h4>
        <div className="space-y-3">
          {stats.languages.slice(0, maxLanguages).map((lang, index) => (
            <motion.div
              key={lang.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <SkillBar
                name={lang.name}
                level={lang.percent}
                color={`bg-[${getLanguageColor(lang.name)}]`}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{lang.text}</span>
                <span>{lang.percent.toFixed(1)}%</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Editors (optional) */}
      {showEditors && stats.editors.length > 0 && (
        <div className="mt-6 pt-6 border-t border-border">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
            Editors
          </h4>
          <div className="flex flex-wrap gap-2">
            {stats.editors.map((editor) => (
              <div
                key={editor.name}
                className="px-3 py-1.5 rounded-full bg-muted text-sm"
              >
                {editor.name}{" "}
                <span className="text-muted-foreground">
                  {editor.percent.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects (optional) */}
      {showProjects && stats.projects.length > 0 && (
        <div className="mt-6 pt-6 border-t border-border">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
            Top Projects
          </h4>
          <div className="space-y-2">
            {stats.projects.slice(0, 3).map((project) => (
              <div
                key={project.name}
                className="flex justify-between items-center text-sm"
              >
                <span className="font-medium truncate max-w-[60%]">
                  {project.name}
                </span>
                <span className="text-muted-foreground">{project.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Code2 className="h-3 w-3" />
          Tracked with{" "}
          <a
            href="https://wakatime.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            WakaTime
          </a>
        </p>
      </div>
    </motion.div>
  );
}

// Compact version for sidebar or smaller spaces
export function CodingStatsCompact({ className = "" }: { className?: string }) {
  const [stats, setStats] = useState<WakaTimeStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/wakatime/stats");
        const data: StatsResponse = await response.json();
        setStats(data.data);
      } catch (error) {
        logError("Failed to fetch coding stats", error, {
          component: "CodingStatsCompact",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div
        className={`flex items-center gap-2 p-3 rounded-lg bg-muted/50 ${className}`}
      >
        <Code2 className="h-4 w-4 text-primary" />
        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (!stats) return null;

  const totalHours = (stats.total_seconds / 3600).toFixed(1);
  const topLanguage = stats.languages[0];

  return (
    <motion.div
      className={`flex items-center gap-3 p-3 rounded-lg bg-muted/50 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Code2 className="h-4 w-4 text-primary" />
      <div className="text-sm">
        <span className="font-semibold">{totalHours}h</span>
        <span className="text-muted-foreground"> coded this week</span>
        {topLanguage && (
          <span className="text-muted-foreground">
            {" "}
            · {topLanguage.name} {topLanguage.percent.toFixed(0)}%
          </span>
        )}
      </div>
    </motion.div>
  );
}

// Widget for dashboard
export function CodingStatsWidget({ className = "" }: { className?: string }) {
  const [stats, setStats] = useState<WakaTimeStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/wakatime/stats");
        const data: StatsResponse = await response.json();
        setStats(data.data);
      } catch (error) {
        logError("Failed to fetch coding stats", error, {
          component: "CodingStatsWidget",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div
        className={`p-4 rounded-xl border border-border bg-card ${className}`}
      >
        <div className="flex items-center gap-2 mb-3">
          <Code2 className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Weekly Coding</span>
        </div>
        <div className="h-8 bg-muted animate-pulse rounded mb-2" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-2 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const totalHours = (stats.total_seconds / 3600).toFixed(1);

  return (
    <motion.div
      className={`p-4 rounded-xl border border-border bg-card ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Weekly Coding</span>
        </div>
        <span className="text-xs text-muted-foreground">{stats.range.text}</span>
      </div>

      <div className="text-3xl font-bold mb-3">
        <AnimatedCounter value={parseFloat(totalHours)} decimals={1} suffix="h" />
      </div>

      {/* Mini language bars */}
      <div className="space-y-2">
        {stats.languages.slice(0, 3).map((lang) => (
          <div key={lang.name} className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: getLanguageColor(lang.name) }}
            />
            <span className="text-xs text-muted-foreground flex-1 truncate">
              {lang.name}
            </span>
            <span className="text-xs font-medium">
              {lang.percent.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
