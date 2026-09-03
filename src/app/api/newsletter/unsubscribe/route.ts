import { getDb } from '@/lib/db';
import { RATE_LIMITS } from '@/lib/rate-limit';
import { withWriteRoute, writeError } from '@/lib/api/write-route';
import { unsubscribeSchema } from '@/lib/validations';

export const POST = withWriteRoute(
  {
    // 3 requests per 5 minutes.
    limit: RATE_LIMITS.NEWSLETTER,
    auth: {
      kind: 'public',
      reason: 'The unsubscribe token in the body is the credential; it arrives by email, not by session.',
    },
    csrf: { kind: 'required' },
    body: { kind: 'json', schema: unsubscribeSchema },
    envelope: { kind: 'standard' },
    errors: {
      log: 'Newsletter Unsubscribe: Unexpected error',
      component: 'newsletter/unsubscribe',
      action: 'POST',
      message: 'Failed to unsubscribe. Please try again later.',
    },
  },
  async ({ data }) => {
    const { token } = data;

    const sql = getDb();

    // Find subscriber by token
    const rows = await sql`SELECT email, is_active FROM newsletter_subscribers WHERE unsubscribe_token = ${token}`;
    const subscriber = rows[0];

    if (!subscriber) {
      throw writeError.notFound('Invalid unsubscribe token');
    }

    if (!subscriber.is_active) {
      return { message: 'Already unsubscribed' };
    }

    // Deactivate subscription
    await sql`UPDATE newsletter_subscribers SET is_active = false WHERE unsubscribe_token = ${token}`;

    return { message: 'Successfully unsubscribed' };
  }
);
