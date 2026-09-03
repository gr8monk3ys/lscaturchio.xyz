import { RATE_LIMITS } from "@/lib/rate-limit";
import { withWriteRoute, writeError } from "@/lib/api/write-route";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { logError, logInfo } from "@/lib/logger";
import { sendOnboardingEmail } from "@/lib/email";

type OnboardingState = {
  step?: number;
  nextAt?: string | null;
  lastSentAt?: string;
  processingAt?: string | null;
};

type NewsletterMetadata = {
  topics?: string[];
  source?: { path?: string };
  onboarding?: OnboardingState;
  [key: string]: unknown;
};

const MAX_STEP = 2;
const BATCH_SIZE = 50;
const PROCESSING_LEASE_MINUTES = 30;

function safeParseMetadata(raw: unknown): NewsletterMetadata {
  if (!raw) return {};
  if (typeof raw === "object") return raw as NewsletterMetadata;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as NewsletterMetadata;
    } catch {
      return {};
    }
  }
  return {};
}

function nextOnboardingAt(step: number): string | null {
  const now = Date.now();
  if (step === 0) return new Date(now + 1000 * 60 * 60 * 24).toISOString(); // +24h
  if (step === 1) return new Date(now + 1000 * 60 * 60 * 24 * 6).toISOString(); // +6d (total ~7d)
  return null;
}

function buildOnboardingState(
  current: OnboardingState | undefined,
  updates: Partial<OnboardingState>
): OnboardingState {
  return {
    ...(current ?? {}),
    ...updates,
  };
}

export const POST = withWriteRoute(
  {
    // Was RATE_LIMITS.PUBLIC (100/min). This endpoint sends up to BATCH_SIZE
    // onboarding emails per call, so 100 calls a minute from one IP is 5,000
    // sends; the scheduled caller runs on the order of once an hour. STANDARD
    // (30/min) is still far above any legitimate cadence.
    limit: RATE_LIMITS.STANDARD,
    auth: { kind: "apiKey", envKey: "NEWSLETTER_ADMIN_API_KEY" },
    csrf: {
      kind: "skip",
      reason:
        "Called by a scheduled machine client with an API key, never by a browser. A cron request sends no Origin or Referer, which validateCsrf rejects outright, so requiring it would break every legitimate call. The API key is the whole authorisation and it is not ambiently attached the way a cookie is, so there is no cross-site request to forge.",
    },
    body: {
      kind: "none",
      reason: "Takes no request body; its only input is the ?dryRun query flag.",
    },
    envelope: { kind: "standard" },
    errors: {
      log: "Newsletter drip failed",
      component: "newsletter/drip",
      action: "POST",
      message: "Failed to send onboarding emails",
    },
  },
  async ({ req }) => {
    if (!isDatabaseConfigured()) {
      throw writeError.internal("DATABASE_URL is not configured");
    }

    const dryRun = req.nextUrl.searchParams.get("dryRun") === "true";

    const sql = getDb();

    const rows = await sql`
      SELECT email, unsubscribe_token, metadata
      FROM newsletter_subscribers
      WHERE is_active = true
        AND (metadata->'onboarding'->>'nextAt') IS NOT NULL
        AND (metadata->'onboarding'->>'nextAt')::timestamptz <= NOW()
        AND COALESCE((metadata->'onboarding'->>'step')::int, 0) < ${MAX_STEP}
        AND (
          (metadata->'onboarding'->>'processingAt') IS NULL
          OR (metadata->'onboarding'->>'processingAt')::timestamptz <= NOW() - (${PROCESSING_LEASE_MINUTES} * INTERVAL '1 minute')
        )
      LIMIT ${BATCH_SIZE}
    `;

    let sent = 0;
    let failed = 0;
    let skipped = 0;

    for (const row of rows) {
      const email = row.email as string | undefined;
      const token = row.unsubscribe_token as string | undefined;
      if (!email || !token) {
        skipped++;
        continue;
      }

      const metadata = safeParseMetadata(row.metadata);
      const currentStep = Number(metadata.onboarding?.step ?? 0);
      const nextStep = currentStep + 1;
      if (!Number.isFinite(nextStep) || nextStep < 1 || nextStep > MAX_STEP) {
        skipped++;
        continue;
      }

      const topics = Array.isArray(metadata.topics) ? metadata.topics : [];

      if (dryRun) {
        sent++;
        continue;
      }

      const claimRows = await sql`
        UPDATE newsletter_subscribers
        SET metadata = jsonb_set(
          COALESCE(metadata, '{}'::jsonb),
          '{onboarding}',
          ${JSON.stringify(
            buildOnboardingState(metadata.onboarding, {
              processingAt: new Date().toISOString(),
            })
          )}::jsonb,
          true
        )
        WHERE email = ${email}
          AND is_active = true
          AND COALESCE((metadata->'onboarding'->>'step')::int, 0) = ${currentStep}
          AND (metadata->'onboarding'->>'nextAt') IS NOT NULL
          AND (metadata->'onboarding'->>'nextAt')::timestamptz <= NOW()
          AND (
            (metadata->'onboarding'->>'processingAt') IS NULL
            OR (metadata->'onboarding'->>'processingAt')::timestamptz <= NOW() - (${PROCESSING_LEASE_MINUTES} * INTERVAL '1 minute')
          )
        RETURNING email
      `;

      if (claimRows.length === 0) {
        skipped++;
        continue;
      }

      let ok = false;
      try {
        ok = await sendOnboardingEmail(email, token, nextStep, { topics });
      } catch (error) {
        logError("Newsletter drip send failed", error, {
          component: "newsletter/drip",
          email,
          step: nextStep,
        });
      }

      if (!ok) {
        failed++;
        await sql`
          UPDATE newsletter_subscribers
          SET metadata = jsonb_set(
            COALESCE(metadata, '{}'::jsonb),
            '{onboarding}',
            ${JSON.stringify(
              buildOnboardingState(metadata.onboarding, {
                processingAt: null,
              })
            )}::jsonb,
            true
          )
          WHERE email = ${email}
        `;
        continue;
      }

      sent++;
      const sentAt = new Date().toISOString();

      await sql`
        UPDATE newsletter_subscribers
        SET metadata = jsonb_set(
          COALESCE(metadata, '{}'::jsonb),
          '{onboarding}',
          ${JSON.stringify(
            buildOnboardingState(metadata.onboarding, {
              step: nextStep,
              lastSentAt: sentAt,
              nextAt: nextOnboardingAt(nextStep),
              processingAt: null,
            })
          )}::jsonb,
          true
        )
        WHERE email = ${email}
      `;
    }

    logInfo("Newsletter drip run complete", {
      component: "newsletter/drip",
      processed: rows.length,
      sent,
      failed,
      skipped,
      dryRun,
    });

    return { processed: rows.length, sent, failed, skipped, dryRun };
  }
);
