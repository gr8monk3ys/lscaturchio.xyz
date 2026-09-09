/**
 * Server-side readers for the /stats page.
 *
 * These are the single source of truth for the three public stats payloads.
 * `/api/views?format=detailed` and `/api/newsletter/stats` serve them to the
 * client, and the /stats server component reads them directly so the page
 * paints real numbers instead of a skeleton on first load.
 *
 * Every reader is total: a missing database or a failing query degrades to the
 * same `available: false` shape the API already returns, so no caller has to
 * handle a throw.
 */

import { getAllBlogs } from "@/lib/getAllBlogs";
import { getBlogStats, type BlogStatsSummary } from "@/lib/blog-data";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { logError } from "@/lib/logger";

export const VIEWS_UNAVAILABLE_MESSAGE = "Public view data is unavailable right now.";
export const NEWSLETTER_UNAVAILABLE_MESSAGE =
  "Newsletter subscriber counts are unavailable right now.";

export interface DetailedViewRow {
  slug: string;
  title: string;
  views: number;
}

export interface DetailedViewsPayload {
  views: DetailedViewRow[];
  total: number;
  available: boolean;
  message?: string;
}

export interface NewsletterStatsPayload {
  activeSubscribers: number | null;
  available: boolean;
  message?: string;
  error?: string;
}

export interface OverviewMetric {
  available: boolean;
  note?: string;
  value: number | null;
}

export interface OverviewData {
  avgReadTime: OverviewMetric;
  newsletterSubscribers: OverviewMetric;
  totalPosts: OverviewMetric;
  totalViews: OverviewMetric;
}

const unavailableViews = (): DetailedViewsPayload => ({
  views: [],
  total: 0,
  available: false,
  message: VIEWS_UNAVAILABLE_MESSAGE,
});

/**
 * Post view counts joined to blog titles. Rows whose slug is no longer a real
 * post are dropped rather than surfacing the raw slug as a title.
 */
export async function getDetailedViews(): Promise<DetailedViewsPayload> {
  if (!isDatabaseConfigured()) {
    return unavailableViews();
  }

  const sql = getDb();
  const rows = await sql`SELECT slug, count FROM views ORDER BY count DESC LIMIT 1000`;

  const allBlogs = await getAllBlogs();
  const blogMap = new Map(allBlogs.map((blog) => [blog.slug, blog.title]));

  const views = rows
    .filter((view) => blogMap.has(view.slug))
    .map((view) => ({
      slug: view.slug,
      title: blogMap.get(view.slug) as string,
      views: view.count,
    }));

  return { views, total: views.length, available: true };
}

/** `getDetailedViews` with the throw folded into the unavailable shape. */
export async function getDetailedViewsSafe(): Promise<DetailedViewsPayload> {
  try {
    return await getDetailedViews();
  } catch (error) {
    logError("Stats: detailed views unavailable", error, {
      component: "stats-data",
      action: "getDetailedViews",
    });
    return unavailableViews();
  }
}

export async function getBlogStatsSafe(): Promise<BlogStatsSummary | null> {
  try {
    return getBlogStats(await getAllBlogs());
  } catch (error) {
    logError("Stats: blog stats unavailable", error, {
      component: "stats-data",
      action: "getBlogStats",
    });
    return null;
  }
}

/**
 * Active newsletter subscriber count. `error` is set only on an unexpected
 * failure — the API route turns that into a 500; an unconfigured database is a
 * 200 with `available: false`.
 */
export async function getNewsletterStats(): Promise<NewsletterStatsPayload> {
  if (!isDatabaseConfigured()) {
    return {
      activeSubscribers: null,
      available: false,
      message: NEWSLETTER_UNAVAILABLE_MESSAGE,
    };
  }

  try {
    const sql = getDb();
    const rows = await sql`SELECT count_active_subscribers()`;

    return {
      activeSubscribers: rows[0].count_active_subscribers || 0,
      available: true,
    };
  } catch (error) {
    logError("Newsletter Stats: Unexpected error", error, {
      component: "newsletter/stats",
      action: "GET",
    });
    return {
      error: "Failed to fetch stats",
      activeSubscribers: null,
      available: false,
      message: NEWSLETTER_UNAVAILABLE_MESSAGE,
    };
  }
}

/**
 * The four headline cards, assembled server-side. Shape-identical to what the
 * client loader produces, so it can be handed to SWR as `fallbackData`.
 */
export async function getStatsOverview(): Promise<OverviewData> {
  const [views, blogStats, newsletter] = await Promise.all([
    getDetailedViewsSafe(),
    getBlogStatsSafe(),
    getNewsletterStats(),
  ]);

  const totalViews = views.available
    ? views.views.reduce((sum, entry) => sum + (entry.views || 0), 0)
    : null;

  return {
    totalViews: {
      value: totalViews,
      available: Boolean(views.available && totalViews !== null),
      note: views.message,
    },
    totalPosts: {
      value: blogStats?.totalPosts ?? null,
      available: typeof blogStats?.totalPosts === "number",
      note: blogStats ? undefined : "Blog metadata is unavailable right now.",
    },
    newsletterSubscribers: {
      value: newsletter.activeSubscribers,
      available: Boolean(newsletter.available && typeof newsletter.activeSubscribers === "number"),
      note: newsletter.message,
    },
    avgReadTime: {
      value: blogStats?.avgReadingTime ?? null,
      available: typeof blogStats?.avgReadingTime === "number",
      note: blogStats ? undefined : "Reading-time estimates are unavailable right now.",
    },
  };
}
