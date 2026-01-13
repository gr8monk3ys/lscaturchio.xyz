"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import {
  BarChart3,
  Users,
  Eye,
  Heart,
  Bookmark,
  FileText,
  Tag,
  TrendingUp,
  Mail,
  UserPlus,
  UserMinus,
  Clock,
} from "lucide-react";

interface AnalyticsData {
  newsletter: {
    activeSubscribers: number;
    totalSubscribers: number;
    unsubscribed: number;
    last30Days: number;
  };
  engagement: {
    totalViews: number;
    totalLikes: number;
    totalBookmarks: number;
    uniquePosts: number;
  };
  topPosts: {
    byViews: { slug: string; title: string; views: number }[];
    byLikes: { slug: string; title: string; likes: number }[];
    byBookmarks: { slug: string; title: string; bookmarks: number }[];
  };
  content: {
    totalPosts: number;
    tags: { name: string; count: number }[];
  };
}

function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  color = "primary",
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  subtitle?: string;
  color?: "primary" | "red" | "green" | "blue" | "purple";
}) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary border-primary/20",
    red: "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800",
    green: "bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800",
    blue: "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    purple: "bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  };

  return (
    <div className={`p-6 rounded-xl border ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-4">
        <Icon className="h-6 w-6" />
        <span className="text-xs font-medium opacity-70">{title}</span>
      </div>
      <p className="text-3xl font-bold">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      {subtitle && (
        <p className="text-sm opacity-70 mt-1">{subtitle}</p>
      )}
    </div>
  );
}

function TopPostsList({
  title,
  icon: Icon,
  posts,
  valueKey,
  valueLabel,
  color,
}: {
  title: string;
  icon: React.ElementType;
  posts: { slug: string; title: string; [key: string]: string | number }[];
  valueKey: string;
  valueLabel: string;
  color: string;
}) {
  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="flex items-center gap-2 mb-4">
        <Icon className={`h-5 w-5 ${color}`} />
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className="space-y-3">
        {posts.map((post, index) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="flex items-center justify-between group hover:translate-x-1 transition-transform"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-xs font-medium text-muted-foreground w-5">
                {index + 1}
              </span>
              <p className="text-sm text-foreground group-hover:text-primary truncate">
                {post.title}
              </p>
            </div>
            <span className={`text-sm font-medium ml-4 ${color}`}>
              {(post[valueKey] as number).toLocaleString()} {valueLabel}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function TagCloud({ tags }: { tags: { name: string; count: number }[] }) {
  if (!tags || tags.length === 0) {
    return null;
  }

  const maxCount = Math.max(...tags.map((t) => t.count));

  return (
    <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="flex items-center gap-2 mb-4">
        <Tag className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Popular Tags</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const intensity = Math.ceil((tag.count / maxCount) * 3);
          const sizeClasses = ["text-xs", "text-sm", "text-base"][intensity - 1];
          return (
            <Link
              key={tag.name}
              href={`/blog?tag=${encodeURIComponent(tag.name)}`}
              className={`px-3 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors ${sizeClasses}`}
            >
              {tag.name}
              <span className="ml-1 opacity-60">({tag.count})</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch("/api/analytics");
        if (!response.ok) {
          throw new Error("Failed to fetch analytics");
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <Container className="py-20">
        <Heading as="h1">Analytics Dashboard</Heading>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-xl bg-muted animate-pulse"
              aria-busy="true"
              role="presentation"
            />
          ))}
        </div>
      </Container>
    );
  }

  if (error || !data) {
    return (
      <Container className="py-20">
        <Heading as="h1">Analytics Dashboard</Heading>
        <div className="mt-10 p-6 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
          <p className="text-red-600 dark:text-red-400">
            {error || "Failed to load analytics data"}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Make sure the database is configured and migrations are run.
          </p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-20">
      <div className="flex items-center gap-3 mb-2">
        <BarChart3 className="h-8 w-8 text-primary" />
        <Heading as="h1">Analytics Dashboard</Heading>
      </div>
      <p className="text-muted-foreground mb-10">
        Overview of your blog performance and engagement metrics.
      </p>

      {/* Newsletter Stats */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Mail className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Newsletter</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Active Subscribers"
            value={data.newsletter.activeSubscribers}
            icon={Users}
            color="green"
          />
          <StatCard
            title="Total Signups"
            value={data.newsletter.totalSubscribers}
            icon={UserPlus}
            color="blue"
          />
          <StatCard
            title="Unsubscribed"
            value={data.newsletter.unsubscribed}
            icon={UserMinus}
            color="red"
          />
          <StatCard
            title="Last 30 Days"
            value={data.newsletter.last30Days}
            icon={Clock}
            subtitle="new subscribers"
            color="purple"
          />
        </div>
      </section>

      {/* Engagement Stats */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Engagement</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Views"
            value={data.engagement.totalViews}
            icon={Eye}
            color="blue"
          />
          <StatCard
            title="Total Likes"
            value={data.engagement.totalLikes}
            icon={Heart}
            color="red"
          />
          <StatCard
            title="Total Bookmarks"
            value={data.engagement.totalBookmarks}
            icon={Bookmark}
            color="primary"
          />
          <StatCard
            title="Posts with Engagement"
            value={data.engagement.uniquePosts}
            icon={FileText}
            subtitle={`of ${data.content.totalPosts} total`}
            color="green"
          />
        </div>
      </section>

      {/* Top Posts */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Top Posts</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <TopPostsList
            title="Most Viewed"
            icon={Eye}
            posts={data.topPosts.byViews}
            valueKey="views"
            valueLabel="views"
            color="text-blue-600 dark:text-blue-400"
          />
          <TopPostsList
            title="Most Liked"
            icon={Heart}
            posts={data.topPosts.byLikes}
            valueKey="likes"
            valueLabel="likes"
            color="text-red-600 dark:text-red-400"
          />
          <TopPostsList
            title="Most Bookmarked"
            icon={Bookmark}
            posts={data.topPosts.byBookmarks}
            valueKey="bookmarks"
            valueLabel="saves"
            color="text-primary"
          />
        </div>
      </section>

      {/* Content Stats */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Content</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Blog Posts</p>
                <p className="text-4xl font-bold text-primary mt-2">
                  {data.content.totalPosts}
                </p>
              </div>
              <FileText className="h-12 w-12 text-primary/20" />
            </div>
          </div>
          <TagCloud tags={data.content.tags} />
        </div>
      </section>
    </Container>
  );
}
