import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import crypto from 'crypto';
import { withRateLimit } from '@/lib/with-rate-limit';
import { RATE_LIMITS } from '@/lib/rate-limit';
import { validateCsrf } from '@/lib/csrf';
import { logError } from '@/lib/logger';
import { newsletterSubscribeSchema, parseBody } from '@/lib/validations';
import { sendWelcomeEmail } from '@/lib/email';
import { apiSuccess, ApiErrors } from '@/lib/api-response';
import { NEWSLETTER_TOPIC_IDS } from '@/constants/newsletter';

const handlePost = async (request: NextRequest) => {
  const csrfError = validateCsrf(request);
  if (csrfError) return csrfError;

  try {
    const body = await request.json();

    // Zod validation (email is normalized/trimmed by schema transform)
    const parsed = parseBody(newsletterSubscribeSchema, body);
    if (!parsed.success) {
      return ApiErrors.badRequest(parsed.error);
    }

    const normalizedEmail = parsed.data.email;
    const allowedTopics = new Set<string>(NEWSLETTER_TOPIC_IDS);
    const topics = Array.from(
      new Set((parsed.data.topics ?? []).map((t) => t.trim()))
    )
      .filter((t) => allowedTopics.has(t))
      .slice(0, 6);
    const source = parsed.data.source;

    const onboardingNextAt = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(); // +24h
    const metadataJson = JSON.stringify({
      ...(topics.length > 0 ? { topics } : {}),
      ...(source ? { source: { path: source } } : {}),
      onboarding: {
        step: 0,
        nextAt: onboardingNextAt,
      },
    });

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
          await sql`
            UPDATE newsletter_subscribers
            SET metadata = COALESCE(metadata, '{}'::jsonb) || ${metadataJson}::jsonb
            WHERE email = ${normalizedEmail}
          `;
        }
        return apiSuccess({ message: 'Already subscribed', alreadySubscribed: true });
      } else {
        // Reactivate subscription
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

        return apiSuccess({ message: 'Successfully resubscribed!', resubscribed: true });
      }
    }

    // Insert new subscriber (no IP/user-agent for GDPR compliance)
    await sql`
      INSERT INTO newsletter_subscribers (email, unsubscribe_token, metadata)
      VALUES (${normalizedEmail}, ${unsubscribeToken}, ${metadataJson}::jsonb)
    `;

    // Send welcome email (non-blocking - don't fail subscription if email fails)
    sendWelcomeEmail(normalizedEmail, unsubscribeToken).catch(() => {});

    return apiSuccess({ message: 'Successfully subscribed to newsletter!' }, 201);
  } catch (error) {
    logError('Newsletter Subscribe: Unexpected error', error, { component: 'newsletter/subscribe', action: 'POST' });
    return ApiErrors.internalError('Failed to subscribe. Please try again later.');
  }
};

// Export with rate limiting (3 requests per 5 minutes to prevent spam)
export const POST = withRateLimit(handlePost, RATE_LIMITS.NEWSLETTER);
