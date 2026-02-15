import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit } from '@/lib/with-rate-limit'
import { RATE_LIMITS } from '@/lib/rate-limit'
import { getPopularPosts } from '@/lib/popular-posts'

function parseLimit(req: NextRequest): number {
  const raw = req.nextUrl.searchParams.get('limit')
  const n = Number.parseInt(raw || '5', 10)
  if (!Number.isFinite(n)) return 5
  return Math.min(Math.max(n, 1), 20)
}

const handleGet = async (req: NextRequest) => {
  const limit = parseLimit(req)
  const result = await getPopularPosts(limit)

  if (result.source === 'error') {
    return NextResponse.json(
      { source: 'error', posts: [] },
      { status: 500 }
    )
  }

  return NextResponse.json(result, {
    headers: {
      'Cache-Control':
        'public, max-age=60, s-maxage=300, stale-while-revalidate=86400',
    },
  })
}

export const GET = withRateLimit(handleGet, RATE_LIMITS.PUBLIC)
