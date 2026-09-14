import { getAllBlogs } from '@/lib/getAllBlogs'
import { getBlogStats } from '@/lib/blog-data'
import { getDb, isDatabaseConfigured } from '@/lib/db'
import { logError } from '@/lib/logger'

const VIEWS_UNAVAILABLE = 'Public view data is unavailable right now.'
const NEWSLETTER_UNAVAILABLE = 'Newsletter subscriber counts are unavailable right now.'

/**
 * A number, or the reason there isn't one.
 *
 * `available: false` with a `note` is a first-class result, not a failure to
 * handle later. The page's stated position is that anything private or
 * unavailable gets labelled rather than guessed, and a metric type that can
 * only carry a number forces every caller to invent the label.
 */
export interface StatMetric {
  available: boolean
  note?: string
  value: number | null
}

export interface RankedPostView {
  slug: string
  title: string
  views: number
}

export interface RankedViews {
  available: boolean
  note?: string
  rows: RankedPostView[]
}

export interface StatsOverview {
  avgReadTime: StatMetric
  newsletterSubscribers: StatMetric
  totalPosts: StatMetric
  totalViews: StatMetric
}

export interface SiteStats {
  /**
   * When the numbers were read, ISO-8601.
   *
   * The page is revalidated rather than rendered per request, so a reader can
   * be looking at counts up to half an hour old. Undated numbers are the
   * ordinary way a stats page starts lying, and a timestamp is also the one
   * thing that lets a reader tell a stale page from a broken one.
   */
  generatedAt: string
  overview: StatsOverview
  rankedViews: RankedViews
}

interface ViewRow {
  slug: string
  count: number | null
}

/**
 * Every view row, once.
 *
 * The page used to ask `/api/views?format=detailed` twice — the overview
 * summed it for a total and the chart ranked it for a top seven — which is the
 * same thousand rows over the wire under two headings. Reading it here once
 * and deriving both is the whole reason a server render is cheaper than the
 * client fetch it replaces, not just more honest.
 */
async function readViewRows(): Promise<ViewRow[] | null> {
  if (!isDatabaseConfigured()) {
    return null
  }

  try {
    const sql = getDb()
    const rows = await sql`SELECT slug, count FROM views ORDER BY count DESC LIMIT 1000`
    return rows as ViewRow[]
  } catch (error) {
    logError('Site stats: failed to query views', error, { component: 'site-stats' })
    return null
  }
}

async function readActiveSubscribers(): Promise<number | null> {
  if (!isDatabaseConfigured()) {
    return null
  }

  try {
    const sql = getDb()
    const rows = await sql`SELECT count_active_subscribers()`
    return rows[0]?.count_active_subscribers ?? 0
  } catch (error) {
    logError('Site stats: failed to count subscribers', error, { component: 'site-stats' })
    return null
  }
}

/**
 * Everything `/stats` renders, resolved before the page is sent.
 *
 * This replaces four client components that each fetched their own API on
 * mount. The states they rendered while waiting were honest in every branch
 * but one: the branch a reader actually got. With JS off, or a request that
 * never returned, the page was sixty-three pulsing bars and no numbers, and
 * nothing on it distinguished "still loading" from "broken".
 *
 * Those components already knew how to say "Unavailable" — that code was
 * simply unreachable, because the server never performed the fetch that would
 * have decided it. Awaiting the data here makes the honest branch the one that
 * ships in the HTML.
 */
export async function getSiteStats(): Promise<SiteStats> {
  const [blogs, viewRows, activeSubscribers] = await Promise.all([
    getAllBlogs(),
    readViewRows(),
    readActiveSubscribers(),
  ])

  const { totalPosts, avgReadingTime } = getBlogStats(blogs)
  const blogTitles = new Map(blogs.map((blog) => [blog.slug, blog.title]))

  // Rows for slugs that are no longer real posts are dropped rather than
  // rendered with the slug as a title — the failure `/api/views` and
  // `popular-posts` both guard, for the same reason.
  const namedViews: RankedPostView[] = (viewRows ?? [])
    .filter((row) => blogTitles.has(row.slug))
    .map((row) => ({
      slug: row.slug,
      title: blogTitles.get(row.slug) as string,
      views: row.count ?? 0,
    }))

  const viewsAvailable = viewRows !== null
  const totalViews = namedViews.reduce((sum, row) => sum + row.views, 0)

  return {
    generatedAt: new Date().toISOString(),
    overview: {
      totalViews: {
        value: viewsAvailable ? totalViews : null,
        available: viewsAvailable,
        note: viewsAvailable ? undefined : VIEWS_UNAVAILABLE,
      },
      // Posts and reading time come off the filesystem, so they are available
      // whenever the page itself is.
      totalPosts: {
        value: totalPosts,
        available: true,
      },
      avgReadTime: {
        value: avgReadingTime,
        available: true,
      },
      newsletterSubscribers: {
        value: activeSubscribers,
        available: activeSubscribers !== null,
        note: activeSubscribers === null ? NEWSLETTER_UNAVAILABLE : undefined,
      },
    },
    rankedViews: {
      available: viewsAvailable,
      note: viewsAvailable ? undefined : VIEWS_UNAVAILABLE,
      rows: namedViews.slice(0, 7),
    },
  }
}
