import { NextRequest, NextResponse } from "next/server";
import { withRateLimit } from "@/lib/with-rate-limit";
import { RATE_LIMITS } from "@/lib/rate-limit";
import { getAllBlogs } from "@/lib/getAllBlogs";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { logError } from "@/lib/logger";

function parseLimit(req: NextRequest): number {
  const raw = req.nextUrl.searchParams.get("limit");
  const n = Number.parseInt(raw || "5", 10);
  if (!Number.isFinite(n)) return 5;
  return Math.min(Math.max(n, 1), 20);
}

const handleGet = async (req: NextRequest) => {
  const limit = parseLimit(req);
  const allBlogs = await getAllBlogs();
  const blogMap = new Map(allBlogs.map((b) => [b.slug, b]));

  if (!isDatabaseConfigured()) {
    const posts = allBlogs
      .map((b) => ({ b, t: new Date(b.date).getTime() }))
      .filter((x) => Number.isFinite(x.t))
      .sort((a, c) => c.t - a.t)
      .slice(0, limit)
      .map(({ b }) => ({
        slug: b.slug,
        title: b.title,
        description: b.description,
        date: b.date,
        tags: b.tags,
        image: b.image,
        views: 0,
      }));

    return NextResponse.json(
      { source: "fallback", posts },
      {
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=86400",
        },
      }
    );
  }

  try {
    const sql = getDb();
    const rows = await sql`
      SELECT slug, count
      FROM views
      ORDER BY count DESC
      LIMIT ${limit}
    `;

    const posts = rows.map((row) => {
      const b = blogMap.get(row.slug);
      return {
        slug: row.slug,
        title: b?.title ?? row.slug,
        description: b?.description ?? "",
        date: b?.date ?? "",
        tags: b?.tags ?? [],
        image: b?.image ?? "/images/blog/default.webp",
        views: row.count ?? 0,
      };
    });

    return NextResponse.json(
      { source: "views", posts },
      {
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    logError("Popular posts: failed to query views", error, { component: "popular-posts" });
    return NextResponse.json(
      { source: "error", posts: [] },
      { status: 500 }
    );
  }
};

export const GET = withRateLimit(handleGet, RATE_LIMITS.PUBLIC);

