import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { withRateLimit } from '@/lib/with-rate-limit';
import { RATE_LIMITS } from '@/lib/rate-limit';
import { logError } from '@/lib/logger';

const handlePost = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Unsubscribe token is required' },
        { status: 400 }
      );
    }

    const sql = getDb();

    // Find subscriber by token
    const rows = await sql`SELECT email, is_active FROM newsletter_subscribers WHERE unsubscribe_token = ${token}`;
    const subscriber = rows[0];

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Invalid unsubscribe token' },
        { status: 404 }
      );
    }

    if (!subscriber.is_active) {
      return NextResponse.json(
        { message: 'Already unsubscribed' },
        { status: 200 }
      );
    }

    // Deactivate subscription
    await sql`UPDATE newsletter_subscribers SET is_active = false WHERE unsubscribe_token = ${token}`;

    return NextResponse.json(
      { message: 'Successfully unsubscribed' },
      { status: 200 }
    );
  } catch (error) {
    logError('Newsletter Unsubscribe: Unexpected error', error, { component: 'newsletter/unsubscribe', action: 'POST' });
    return NextResponse.json(
      { error: 'Failed to unsubscribe. Please try again later.' },
      { status: 500 }
    );
  }
};

// Export with rate limiting (3 requests per 5 minutes)
export const POST = withRateLimit(handlePost, RATE_LIMITS.NEWSLETTER);
