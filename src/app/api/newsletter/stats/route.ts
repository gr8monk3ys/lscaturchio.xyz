import { NextRequest } from 'next/server';
import { getDb, isDatabaseConfigured } from '@/lib/db';
import { withRateLimit } from '@/lib/with-rate-limit';
import { RATE_LIMITS } from '@/lib/rate-limit';
import { logError } from '@/lib/logger';
import { apiSuccess, ApiErrors } from '@/lib/api-response';

const UNAVAILABLE_MESSAGE = 'Newsletter subscriber counts are unavailable right now.';

const handleGet = async (request: NextRequest) => {
  void request;

  if (!isDatabaseConfigured()) {
    return apiSuccess({
      activeSubscribers: null,
      available: false,
      message: UNAVAILABLE_MESSAGE,
    });
  }

  try {
    const sql = getDb();
    const rows = await sql`SELECT count_active_subscribers()`;

    return apiSuccess({
      activeSubscribers: rows[0].count_active_subscribers || 0,
      available: true,
    });
  } catch (error) {
    logError('Newsletter Stats: Unexpected error', error, { component: 'newsletter/stats', action: 'GET' });
    return ApiErrors.internalError('Failed to fetch stats');
  }
};

// Export with rate limiting (100 requests per minute - public read-only endpoint)
export const GET = withRateLimit(handleGet, RATE_LIMITS.PUBLIC);
