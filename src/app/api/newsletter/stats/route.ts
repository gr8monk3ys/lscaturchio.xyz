import { NextRequest, NextResponse } from 'next/server';
import { getDb, isDatabaseConfigured } from '@/lib/db';
import { withRateLimit } from '@/lib/with-rate-limit';
import { RATE_LIMITS } from '@/lib/rate-limit';
import { logError } from '@/lib/logger';

const handleGet = async (request: NextRequest) => {
  void request;

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        activeSubscribers: null,
        available: false,
        message: 'Newsletter subscriber counts are unavailable right now.',
      },
      { status: 200 }
    );
  }

  try {
    const sql = getDb();
    const rows = await sql`SELECT count_active_subscribers()`;

    return NextResponse.json(
      {
        activeSubscribers: rows[0].count_active_subscribers || 0,
        available: true,
      },
      { status: 200 }
    );
  } catch (error) {
    logError('Newsletter Stats: Unexpected error', error, { component: 'newsletter/stats', action: 'GET' });
    return NextResponse.json(
      {
        error: 'Failed to fetch stats',
        activeSubscribers: null,
        available: false,
        message: 'Newsletter subscriber counts are unavailable right now.',
      },
      { status: 500 }
    );
  }
};

// Export with rate limiting (100 requests per minute - public read-only endpoint)
export const GET = withRateLimit(handleGet, RATE_LIMITS.PUBLIC);
