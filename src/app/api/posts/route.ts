import { NextRequest } from "next/server";
import { withRateLimit } from "@/lib/with-rate-limit";
import { RATE_LIMITS } from "@/lib/rate-limit";
import { getAllBlogs } from "@/lib/getAllBlogs";
import { hasAudioForSlug } from "@/lib/audio";
import { getAbsoluteAudioUrl } from "@/lib/audio-url";
import { getSiteUrl } from "@/lib/site-url";
import { apiSuccess } from "@/lib/api-response";

const handleGet = async (req: NextRequest) => {
  const siteUrl = getSiteUrl();
  const limitRaw = req.nextUrl.searchParams.get("limit");
  const limit = Math.min(
    Math.max(Number.parseInt(limitRaw || "200", 10) || 200, 1),
    500
  );

  const posts = await getAllBlogs();

  const data = posts.slice(0, limit).map((p) => {
    const hasAudio = hasAudioForSlug(p.slug);
    return {
      slug: p.slug,
      url: `${siteUrl}/blog/${p.slug}`,
      title: p.title,
      description: p.description,
      date: p.date,
      updated: p.updated,
      tags: p.tags,
      image: p.image,
      readingTimeMinutes: p.readingTimeMinutes,
      words: p.words,
      hasAudio,
      audioUrl: hasAudio ? getAbsoluteAudioUrl(p.slug, siteUrl) : null,
      series: p.series ?? null,
      seriesOrder: p.seriesOrder ?? null,
    };
  });

  return apiSuccess(
    { count: data.length, posts: data },
    {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
};

export const GET = withRateLimit(handleGet, RATE_LIMITS.PUBLIC);

