import { NextResponse } from 'next/server'
import { logError } from '@/lib/logger'
import { withRateLimit, RATE_LIMITS } from '@/lib/with-rate-limit'
import { getGithubPortfolioRepos } from '@/lib/github-repos'

const handleGet = async () => {
  try {
    const repos = await getGithubPortfolioRepos()

    return NextResponse.json(repos, {
      headers: {
        'Cache-Control':
          'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    })
  } catch (error) {
    logError('GitHub API: Unexpected error', error, {
      component: 'github',
      action: 'GET',
    })
    return NextResponse.json(
      { error: 'Failed to fetch repositories' },
      { status: 500 }
    )
  }
}

export const GET = withRateLimit(handleGet, RATE_LIMITS.PUBLIC)
