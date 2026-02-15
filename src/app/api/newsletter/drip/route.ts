import { NextRequest, NextResponse } from "next/server";
import { withRateLimit } from "@/lib/with-rate-limit";
import { RATE_LIMITS } from "@/lib/rate-limit";
import { validateApiKey } from "@/lib/api-auth";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { logError, logInfo } from "@/lib/logger";
import { sendOnboardingEmail } from "@/lib/email";

type OnboardingState = {
  step?: number;
  nextAt?: string | null;
  lastSentAt?: string;
};

type NewsletterMetadata = {
  topics?: string[];
  source?: { path?: string };
  onboarding?: OnboardingState;
  [key: string]: unknown;
};

const MAX_STEP = 2;
const BATCH_SIZE = 50;

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

const handlePost = async (req: NextRequest) => {
  const authError = validateApiKey(req, {
    envKey: "NEWSLETTER_ADMIN_API_KEY",
    component: "newsletter/drip",
    action: "POST",
  });
  if (authError) return authError;

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 500 });
  }

  const dryRun = req.nextUrl.searchParams.get("dryRun") === "true";

  try {
    const sql = getDb();

    const rows = await sql`
      SELECT email, unsubscribe_token, metadata
      FROM newsletter_subscribers
      WHERE is_active = true
        AND (metadata->'onboarding'->>'nextAt') IS NOT NULL
        AND (metadata->'onboarding'->>'nextAt')::timestamptz <= NOW()
        AND COALESCE((metadata->'onboarding'->>'step')::int, 0) < ${MAX_STEP}
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

      const ok = await sendOnboardingEmail(email, token, nextStep, { topics });
      if (!ok) {
        failed++;
        continue;
      }

      sent++;

      const updated: NewsletterMetadata = {
        ...metadata,
        onboarding: {
          ...(metadata.onboarding ?? {}),
          step: nextStep,
          lastSentAt: new Date().toISOString(),
          nextAt: nextOnboardingAt(nextStep),
        },
      };

      await sql`
        UPDATE newsletter_subscribers
        SET metadata = ${JSON.stringify(updated)}::jsonb
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

    return NextResponse.json(
      { processed: rows.length, sent, failed, skipped, dryRun },
      { status: 200 }
    );
  } catch (error) {
    logError("Newsletter drip failed", error, { component: "newsletter/drip" });
    return NextResponse.json({ error: "Failed to send onboarding emails" }, { status: 500 });
  }
};

export const POST = withRateLimit(handlePost, RATE_LIMITS.PUBLIC);

