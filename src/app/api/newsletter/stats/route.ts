import { NextRequest } from 'next/server';
import { withRateLimit } from '@/lib/with-rate-limit';
import { RATE_LIMITS } from '@/lib/rate-limit';
import { apiSuccess, ApiErrors } from '@/lib/api-response';
import { getNewsletterStats } from '@/lib/stats-data';

const handleGet = async (request: NextRequest) => {
  void request;

  // Shared with the /stats server component, which reads getNewsletterStats()
  // directly. An unconfigured database is a 200 "unavailable"; an unexpected
  // failure (already logged inside getNewsletterStats) is reported as a 500.
  const stats = await getNewsletterStats();

  return stats.error ? ApiErrors.internalError(stats.error) : apiSuccess(stats);
};

// Export with rate limiting (100 requests per minute - public read-only endpoint)
export const GET = withRateLimit(handleGet, RATE_LIMITS.PUBLIC);
