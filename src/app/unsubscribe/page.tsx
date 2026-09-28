import type { Metadata } from "next";
import { UnsubscribePageClient, type UnsubscribeStatus } from "@/components/pages/unsubscribe-page-client";
import { getDb } from "@/lib/db";
import { logError } from "@/lib/logger";
import { buildPageMetadata } from "@/lib/seo";
import {
  readSearchParam,
  type SearchParamValue,
} from "@/lib/search-params";

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: "Unsubscribe",
    description:
      "Manage your newsletter preferences and unsubscribe from Lorenzo Scaturchio email updates.",
    path: "/unsubscribe",
  }),
  // A one-time link keyed to a subscriber must never enter an index.
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

type UnsubscribeState = { status: UnsubscribeStatus; message: string };

/**
 * Reads the subscription and never writes it. Mail security scanners (Outlook
 * Safe Links, Gmail's link checks) GET every link in a message, so when this
 * page performed the UPDATE, subscribers were removed without clicking. An
 * active subscriber now gets a button that POSTs to
 * /api/newsletter/unsubscribe, which is CSRF-checked and rate limited.
 */
async function resolveUnsubscribeState(token: string): Promise<UnsubscribeState> {
  const sql = getDb();
  const rows = await sql`SELECT is_active FROM newsletter_subscribers WHERE unsubscribe_token = ${token}`;
  const subscriber = rows[0];

  if (!subscriber) {
    return { status: "error", message: "Invalid unsubscribe token" };
  }

  if (!subscriber.is_active) {
    return { status: "success", message: "Already unsubscribed" };
  }

  return { status: "confirm", message: "" };
}

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, SearchParamValue>>;
}) {
  const params = (await searchParams) ?? {};
  const token = readSearchParam(params, "token").trim();

  if (!token) {
    return <UnsubscribePageClient status="no-token" message="No unsubscribe token provided" />;
  }

  let state: UnsubscribeState;
  try {
    state = await resolveUnsubscribeState(token);
  } catch (error) {
    logError("Failed to process unsubscribe page request", error, {
      page: "unsubscribe",
    });
    state = {
      status: "error",
      message: "Network error. Please try again later.",
    };
  }

  return <UnsubscribePageClient status={state.status} message={state.message} token={token} />;
}
