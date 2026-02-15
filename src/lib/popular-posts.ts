import { getAllBlogs } from '@/lib/getAllBlogs'
import { getDb, isDatabaseConfigured } from '@/lib/db'
import { logError } from '@/lib/logger'

export interface PopularPost {
  slug: string
  title: string
  description: string
  date: string
  tags: string[]
  image: string
  views: number
}

/**
 * Fetch popular posts by view count.
 * Shared between the API route and server-side callers (e.g. page.tsx).
 */
export async function getPopularPosts(limit: number = 5): Promise<{
  source: string
  posts: PopularPost[]
}> {
  const clampedLimit = Math.min(Math.max(limit, 1), 20)
  const allBlogs = await getAllBlogs()
  const blogMap = new Map(allBlogs.map((b) => [b.slug, b]))

  if (!isDatabaseConfigured()) {
    const posts = allBlogs
      .map((b) => ({ b, t: new Date(b.date).getTime() }))
      .filter((x) => Number.isFinite(x.t))
      .sort((a, c) => c.t - a.t)
      .slice(0, clampedLimit)
      .map(({ b }) => ({
        slug: b.slug,
        title: b.title,
        description: b.description,
        date: b.date,
        tags: b.tags,
        image: b.image,
        views: 0,
      }))

    return { source: 'fallback', posts }
  }

  try {
    const sql = getDb()
    const rows = await sql`
      SELECT slug, count
      FROM views
      ORDER BY count DESC
      LIMIT ${clampedLimit}
    `

    const posts = rows.map((row) => {
      const b = blogMap.get(row.slug)
      return {
        slug: row.slug,
        title: b?.title ?? row.slug,
        description: b?.description ?? '',
        date: b?.date ?? '',
        tags: b?.tags ?? [],
        image: b?.image ?? '/images/blog/default.webp',
        views: row.count ?? 0,
      }
    })

    return { source: 'views', posts }
  } catch (error) {
    logError('Popular posts: failed to query views', error, {
      component: 'popular-posts',
    })
    return { source: 'error', posts: [] }
  }
}
