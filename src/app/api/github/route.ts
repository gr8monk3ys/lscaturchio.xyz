import { logError } from '@/lib/logger'
import { withRateLimit, RATE_LIMITS } from '@/lib/with-rate-limit'
import { getGithubPortfolioRepos } from '@/lib/github-repos'
import { apiSuccess, ApiErrors } from '@/lib/api-response'

const handleGet = async () => {
  try {
    const repos = await getGithubPortfolioRepos()

    return apiSuccess(repos, {
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
    return ApiErrors.internalError('Failed to fetch repositories')
  }
}

export const GET = withRateLimit(handleGet, RATE_LIMITS.PUBLIC)
