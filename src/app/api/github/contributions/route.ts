import { apiSuccess } from '@/lib/api-response';
import { withRateLimit } from '@/lib/with-rate-limit';
import { RATE_LIMITS } from '@/lib/rate-limit';
import { getGithubContributions } from '@/lib/github-contributions';

const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=300, s-maxage=1800, stale-while-revalidate=86400',
};

/**
 * GET /api/github/contributions
 *
 * A wrapper over `getGithubContributions`, which is where the GraphQL query
 * and the degraded-calendar shape now live. `/stats` awaits that function
 * directly rather than calling this route from the browser — the same
 * arrangement `/api/popular-posts` has with `getPopularPosts`.
 */
const handleGet = async () => {
  const payload = await getGithubContributions();

  return apiSuccess(payload, {
    status: 200,
    headers: CACHE_HEADERS,
  });
};

export const GET = withRateLimit(handleGet, RATE_LIMITS.STANDARD);
