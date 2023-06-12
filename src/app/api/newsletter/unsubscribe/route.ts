import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { withRateLimit } from '@/lib/with-rate-limit';
import { RATE_LIMITS } from '@/lib/rate-limit';
import { validateCsrf } from '@/lib/csrf';
import { logError } from '@/lib/logger';
import { unsubscribeSchema, parseBody } from '@/lib/validations';
import { apiSuccess, ApiErrors } from '@/lib/api-response';

const handlePost = async (request: NextRequest) => {
  const csrfError = validateCsrf(request);
  if (csrfError) return csrfError;

  try {
    const body = await request.json();
    const parsed = parseBody(unsubscribeSchema, body);

    if (!parsed.success) {
      return ApiErrors.badRequest(parsed.error);
    }

    const { token } = parsed.data;

    const sql = getDb();

    // Find subscriber by token
    const rows = await sql`SELECT email, is_active FROM newsletter_subscribers WHERE unsubscribe_token = ${token}`;
    const subscriber = rows[0];

    if (!subscriber) {
      return ApiErrors.notFound('Invalid unsubscribe token');
    }

    if (!subscriber.is_active) {
      return apiSuccess({ message: 'Already unsubscribed' });
    }

    // Deactivate subscription
    await sql`UPDATE newsletter_subscribers SET is_active = false WHERE unsubscribe_token = ${token}`;

    return apiSuccess({ message: 'Successfully unsubscribed' });
  } catch (error) {
    logError('Newsletter Unsubscribe: Unexpected error', error, { component: 'newsletter/unsubscribe', action: 'POST' });
    return ApiErrors.internalError('Failed to unsubscribe. Please try again later.');
  }
};

// Export with rate limiting (3 requests per 5 minutes)
export const POST = withRateLimit(handlePost, RATE_LIMITS.NEWSLETTER);
