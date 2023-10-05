import type { Metadata } from "next";
import { ogCardUrl } from "@/lib/seo";
import { UnsubscribePageClient, type UnsubscribeStatus } from "@/components/pages/unsubscribe-page-client";
import { getDb } from "@/lib/db";
import { logError } from "@/lib/logger";

export const metadata: Metadata = {
  title: "Unsubscribe",
  description:
    "Manage your newsletter preferences and unsubscribe from Lorenzo Scaturchio email updates.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Unsubscribe | Lorenzo Scaturchio",
    description: "Manage your newsletter subscription preferences.",
    images: [
      {
        url: ogCardUrl({
          title: "Newsletter",
          description: "Subscription preferences",
          type: "default",
        }),
        width: 1200,
        height: 630,
      },
    ],
  },
};
export const dynamic = "force-dynamic";

type SearchParamValue = string | string[] | undefined;

function getSearchParamValue(params: Record<string, SearchParamValue>, key: string): string {
  const value = params[key];
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

async function resolveUnsubscribeState(
  token: string
): Promise<{ status: UnsubscribeStatus; message: string }> {
  const sql = getDb();
  const rows = await sql`SELECT is_active FROM newsletter_subscribers WHERE unsubscribe_token = ${token}`;
  const subscriber = rows[0];

  if (!subscriber) {
    return { status: "error", message: "Invalid unsubscribe token" };
  }

  if (!subscriber.is_active) {
    return { status: "success", message: "Already unsubscribed" };
  }

  await sql`UPDATE newsletter_subscribers SET is_active = false WHERE unsubscribe_token = ${token}`;
  return { status: "success", message: "Successfully unsubscribed" };
}

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, SearchParamValue>>;
}) {
  const params = (await searchParams) ?? {};
  const token = getSearchParamValue(params, "token").trim();

  if (!token) {
    return <UnsubscribePageClient status="no-token" message="No unsubscribe token provided" />;
  }

  let state: { status: UnsubscribeStatus; message: string };
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

  return <UnsubscribePageClient status={state.status} message={state.message} />;
}
