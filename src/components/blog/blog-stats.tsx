import { BookOpen, Clock3, Tag, TrendingUp } from "lucide-react";

interface BlogStatsData {
  totalPosts: number;
  totalReadingTime: number;
  avgReadingTime: number;
  topTags: { tag: string; count: number }[];
}

interface BlogStatsProps {
  stats: BlogStatsData;
}

const statCards = [
  {
    icon: BookOpen,
    key: "totalPosts",
    label: "Posts",
    value: (stats: BlogStatsData) => stats.totalPosts.toString(),
  },
  {
    icon: Clock3,
    key: "totalReadingTime",
    label: "Total Reading",
    value: (stats: BlogStatsData) => `${stats.totalReadingTime} min`,
  },
  {
    icon: TrendingUp,
    key: "avgReadingTime",
    label: "Average Read",
    value: (stats: BlogStatsData) => `${stats.avgReadingTime} min`,
  },
  {
    icon: Tag,
    key: "topTag",
    label: "Top Tag",
    value: (stats: BlogStatsData) => stats.topTags[0]?.tag || "N/A",
  },
] as const;

export function BlogStats({ stats }: BlogStatsProps) {
  return (
    <section
      className="rounded-2xl border border-border/70 bg-muted/20 p-5"
      style={{ contentVisibility: "auto", containIntrinsicSize: "1px 260px" }}
    >
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Browse at a Glance
          </h2>
          <p className="text-sm text-muted-foreground">
            A quick snapshot before you dive into the archive.
          </p>
        </div>
      </div>

      <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <div key={stat.key} className="rounded-xl bg-background/80 px-4 py-3 shadow-[inset_0_1px_0_hsl(var(--border))]">
              <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="h-4 w-4 text-primary" />
                {stat.label}
              </dt>
              <dd className="mt-2 text-lg font-semibold text-foreground">
                {stat.value(stats)}
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
