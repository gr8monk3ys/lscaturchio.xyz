import { getDb } from '@/lib/db';
import crypto from 'crypto';
import { RATE_LIMITS } from '@/lib/rate-limit';
import { withWriteRoute } from '@/lib/api/write-route';
import { newsletterSubscribeSchema } from '@/lib/validations';
import { sendWelcomeEmail } from '@/lib/email';
import { NEWSLETTER_TOPIC_IDS } from '@/constants/newsletter';

function buildMetadataJson(
  topics: string[],
  source: string | undefined,
  includeOnboarding: boolean
): string {
  const metadata: Record<string, unknown> = {
    ...(topics.length > 0 ? { topics } : {}),
    ...(source ? { source: { path: source } } : {}),
  };

  if (includeOnboarding) {
    metadata.onboarding = {
      step: 0,
      nextAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    };
  }

  return JSON.stringify(metadata);
}

/**
 * One message for every outcome — new subscriber, already subscribed, or
 * reactivated. The side effects still differ; the response must not, or the
 * endpoint becomes a membership oracle for any address someone cares to try.
 */
const SUBSCRIBE_MESSAGE = 'Thanks! Check your inbox to confirm your subscription.';

export const POST = withWriteRoute(
  {
    // 3 requests per 5 minutes to prevent spam.
    limit: RATE_LIMITS.NEWSLETTER,
    auth: {
      kind: 'public',
      reason: 'Signing up for the newsletter is by definition an unauthenticated action.',
    },
    csrf: { kind: 'required' },
    body: { kind: 'json', schema: newsletterSubscribeSchema },
    envelope: { kind: 'standard' },
    errors: {
      log: 'Newsletter Subscribe: Unexpected error',
      component: 'newsletter/subscribe',
      action: 'POST',
      message: 'Failed to subscribe. Please try again later.',
    },
  },
  async ({ data }) => {
    const normalizedEmail = data.email;
    const allowedTopics = new Set<string>(NEWSLETTER_TOPIC_IDS);
    const topics = Array.from(new Set((data.topics ?? []).map((t: string) => t.trim())))
      .filter((t) => allowedTopics.has(t))
      .slice(0, 6);
    const source = data.source;

    // Generate unsubscribe token
    const unsubscribeToken = crypto.randomBytes(32).toString('hex');

    const sql = getDb();

    // Check if email already exists
    const rows = await sql`SELECT email, is_active FROM newsletter_subscribers WHERE email = ${normalizedEmail}`;
    const existing = rows[0];

    if (existing) {
      if (existing.is_active) {
        // Allow updating topic preferences even when already subscribed.
        if (topics.length > 0 || source) {
          const metadataJson = buildMetadataJson(topics, source, false);
          await sql`
            UPDATE newsletter_subscribers
            SET metadata = COALESCE(metadata, '{}'::jsonb) || ${metadataJson}::jsonb
            WHERE email = ${normalizedEmail}
          `;
        }
        // Same body and status as every other outcome. Distinct responses
        // let anyone probe whether a given address is on the list.
        return { message: SUBSCRIBE_MESSAGE };
      }

      // Reactivate subscription
      const metadataJson = buildMetadataJson(topics, source, true);
      await sql`
        UPDATE newsletter_subscribers
        SET
          is_active = true,
          subscribed_at = NOW(),
          unsubscribe_token = ${unsubscribeToken},
          metadata = COALESCE(metadata, '{}'::jsonb) || ${metadataJson}::jsonb
        WHERE email = ${normalizedEmail}
      `;

      // Send welcome back email (non-blocking)
      sendWelcomeEmail(normalizedEmail, unsubscribeToken).catch(() => {});

      return { message: SUBSCRIBE_MESSAGE };
    }

    // Insert new subscriber (no IP/user-agent for GDPR compliance)
    const metadataJson = buildMetadataJson(topics, source, true);
    await sql`
      INSERT INTO newsletter_subscribers (email, unsubscribe_token, metadata)
      VALUES (${normalizedEmail}, ${unsubscribeToken}, ${metadataJson}::jsonb)
    `;

    // Send welcome email (non-blocking - don't fail subscription if email fails)
    sendWelcomeEmail(normalizedEmail, unsubscribeToken).catch(() => {});

    // 200, not 201: a distinct status code discloses that this address was new.
    return { message: SUBSCRIBE_MESSAGE };
  }
);
