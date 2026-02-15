import { NextRequest, NextResponse } from "next/server";
import { withRateLimit } from "@/lib/with-rate-limit";
import { RATE_LIMITS } from "@/lib/rate-limit";
import { fetchWebmentions } from "@/lib/webmentions";
import { getSiteUrl } from "@/lib/site-url";

function isSafePath(path: string): boolean {
  if (!path.startsWith("/")) return false;
  if (path.length > 500) return false;
  // Disallow protocol-relative or absolute URLs
  if (path.startsWith("//")) return false;
  if (path.includes("://")) return false;
  // Keep it tight: paths only, no fragments.
  if (path.includes("#")) return false;
  return true;
}

const handleGet = async (req: NextRequest) => {
  const path = req.nextUrl.searchParams.get("path") ?? "";
  if (!path || !isSafePath(path)) {
    return NextResponse.json(
      { error: "Invalid or missing path" },
      { status: 400 }
    );
  }

  const siteUrl = getSiteUrl();
  const target = new URL(path, siteUrl).toString();

  try {
    const data = await fetchWebmentions(target);
    return NextResponse.json(data, {
      headers: {
        // Webmentions don't need to be real-time; cache at the edge when possible.
        "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    // Never hard-fail the UI on webmention outages.
    return NextResponse.json(
      {
        target,
        counts: { like: 0, repost: 0, reply: 0, mention: 0 },
        entries: [],
        degraded: true,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  }
};

export const GET = withRateLimit(handleGet, RATE_LIMITS.PUBLIC);
