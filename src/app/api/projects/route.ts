import { NextResponse } from "next/server";
import { withRateLimit } from "@/lib/with-rate-limit";
import { RATE_LIMITS } from "@/lib/rate-limit";
import { products } from "@/constants/products";

const handleGet = async () => {
  const projects = products.map((p) => ({
    slug: p.slug ?? "",
    title: p.title,
    description: p.description,
    href: p.href,
    stack: p.stack ?? [],
    categories: p.categories ?? [],
    featured: Boolean(p.featured),
    status: p.status ?? "active",
    startDate: p.startDate ?? null,
    demoUrl: p.demoUrl ?? null,
    sourceUrl: p.sourceUrl ?? null,
    caseStudy: p.caseStudy ?? null,
  }));

  return NextResponse.json(
    { count: projects.length, projects },
    {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
};

export const GET = withRateLimit(handleGet, RATE_LIMITS.PUBLIC);

