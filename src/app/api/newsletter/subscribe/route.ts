import { after } from 'next/server';
import { getDb } from '@/lib/db';
import crypto from 'crypto';
import { withWriteRoute, writeError } from '@/lib/api/write-route';
import { newsletterSubscribeSchema } from '@/lib/validations';
import { deliverMail } from '@/lib/mail/deliver';
import { renderWelcomeEmail } from '@/lib/mail/templates';
import { NEWSLETTER_TOPIC_IDS } from '@/constants/newsletter';
import { isNewsletterSignupOpen, SIGNUP_PAUSED_MESSAGE } from '@/lib/newsletter-signup';

function buildMetadataJson(topics: string[], source: string | undefined): string {
  return JSON.stringify({
    ...(topics.length > 0 ? { topics } : {}),
    ...(source ? { source: { path: source } } : {}),
  });
}

/**
 * One message for every outcome — new subscriber, already subscribed, or
 * reactivated. The side effects still differ; the response must not, or the
 * endpoint becomes a membership oracle for any address someone cares to try.
 *
 * It used to say "check your inbox to confirm your subscription". There is no
 * confirmation step: the address is active the moment it is stored. The line
 * now promises only the welcome note, and only to a new address.
 */
const SUBSCRIBE_MESSAGE =
  "Thanks. You're on the list. If the address is new here, a welcome note is on its way.";

/**
 * After the response, not awaited by it: the subscription stands whether or
 * not the welcome email leaves, and the reader must not wait on Resend.
 *
 * `after()` rather than a bare un-awaited promise. On Vercel a function may be
 * frozen as soon as its response is sent, so a floating promise could be cut
 * off mid-request and the welcome email silently never leave; `after` keeps
 * the invocation alive until the callback settles. deliverMail never throws
 * and logs its own failures, so nothing here is swallowed.
 */
function sendWelcome(email: string, unsubscribeToken: string): void {
  after(() =>
    deliverMail(
      { to: email, ...renderWelcomeEmail(unsubscribeToken) },
      { component: 'newsletter/subscribe', action: 'POST' }
    )
  );
}

export const POST = withWriteRoute(
  {
    // 3 requests per 5 minutes to prevent spam.
    limit: 'NEWSLETTER_SUBSCRIBE',
    auth: {
      kind: 'public',
      reason: 'Signing up for the newsletter is by definition an unauthenticated action.',
    },
    csrf: { kind: 'required' },
    body: { kind: 'json', schema: newsletterSubscribeSchema },
    // It mails whatever address it is given, so a script posting here turns
    // the site into a sender of unsolicited welcome email.
    guard: {
      kind: 'humanForm',
      path: '/api/newsletter/subscribe',
      // Lower than the contact form's: one field, which autofill can fill.
      // Measured from the form mounting at the end of an essay, so a reader
      // is far past it; a script filling on load is well under it.
      minFillMs: 1000,
      refusal: 'This signup was flagged as automated and was not saved.',
      dropped: { message: SUBSCRIBE_MESSAGE },
    },
    envelope: { kind: 'standard' },
    errors: {
      log: 'Newsletter Subscribe: Unexpected error',
      component: 'newsletter/subscribe',
      action: 'POST',
      message: 'Failed to subscribe. Please try again later.',
    },
  },
  async ({ data }) => {
    // Paused: the form is hidden too, so this answers a stale page or a
    // script. Refused before the database, so nothing is stored or mailed.
    if (!isNewsletterSignupOpen()) {
      throw writeError.unavailable(SIGNUP_PAUSED_MESSAGE);
    }

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
        // Nothing is written for an address that is already on the list.
        // This form is unauthenticated: merging its topics here let anyone
        // who knew a subscriber's address overwrite that person's topic
        // preferences.
        // Same body and status as every other outcome. Distinct responses
        // let anyone probe whether a given address is on the list.
        return { message: SUBSCRIBE_MESSAGE };
      }

      // Reactivate subscription
      const metadataJson = buildMetadataJson(topics, source);
      await sql`
        UPDATE newsletter_subscribers
        SET
          is_active = true,
          subscribed_at = NOW(),
          unsubscribe_token = ${unsubscribeToken},
          metadata = COALESCE(metadata, '{}'::jsonb) || ${metadataJson}::jsonb
        WHERE email = ${normalizedEmail}
      `;

      sendWelcome(normalizedEmail, unsubscribeToken);

      return { message: SUBSCRIBE_MESSAGE };
    }

    // Insert new subscriber (no IP/user-agent for GDPR compliance)
    const metadataJson = buildMetadataJson(topics, source);
    // Two requests for one new address can both pass the SELECT above. Without
    // ON CONFLICT the second INSERT hit the unique index and the reader got a
    // 500 for a signup that had worked. The welcome note goes only to the
    // request whose row was stored: its token is the one that unsubscribes.
    const inserted = await sql`
      INSERT INTO newsletter_subscribers (email, unsubscribe_token, metadata)
      VALUES (${normalizedEmail}, ${unsubscribeToken}, ${metadataJson}::jsonb)
      ON CONFLICT (email) DO NOTHING
      RETURNING email
    `;

    if (inserted.length > 0) sendWelcome(normalizedEmail, unsubscribeToken);

    // 200, not 201: a distinct status code discloses that this address was new.
    return { message: SUBSCRIBE_MESSAGE };
  }
);
