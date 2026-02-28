import { BookOpen, Clock, Tag, TrendingUp } from "lucide-react";

interface BlogStatsData {
  totalPosts: number;
  totalReadingTime: number;
  avgReadingTime: number;
  topTags: { tag: string; count: number }[];
}

interface BlogStatsProps {
  stats: BlogStatsData;
}

/**
 * Blog statistics component
 * Displays aggregate statistics about the blog content
 */
export function BlogStats({ stats }: BlogStatsProps) {
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
    <div className="mb-8 grid grid-cols-2 gap-6 md:grid-cols-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="rounded-2xl neu-card p-5">
            <div className="flex items-center gap-3">
              <div className={`rounded-xl neu-flat-sm p-3 ${stat.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="truncate text-lg font-bold">{stat.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
