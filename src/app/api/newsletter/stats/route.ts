import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { withRateLimit } from '@/lib/with-rate-limit';
import { RATE_LIMITS } from '@/lib/rate-limit';
import { logError } from '@/lib/logger';
import { validateApiKey } from '@/lib/api-auth';

const handleGet = async (request: NextRequest) => {
  // Require API key authentication
  const authError = validateApiKey(request, { component: 'newsletter/stats' });
  if (authError) return authError;

  try {
    const sql = getDb();
    const rows = await sql`SELECT count_active_subscribers()`;

    return NextResponse.json(
      { activeSubscribers: rows[0].count_active_subscribers || 0 },
      { status: 200 }
    );
  } catch (error) {
    logError('Newsletter Stats: Unexpected error', error, { component: 'newsletter/stats', action: 'GET' });
    return NextResponse.json(
      { error: 'Failed to fetch stats', activeSubscribers: 0 },
      { status: 500 }
    );
  }
};

// Export with rate limiting (100 requests per minute - public read-only endpoint)
export const GET = withRateLimit(handleGet, RATE_LIMITS.PUBLIC);
