import type { Metadata } from "next";
import { SeriesPageClient, type Series } from "@/components/pages/series-page-client";
import { listSeries } from "@/lib/getAllBlogs";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Series",
  description:
    "Multi-part writing series from Lorenzo Scaturchio, organized by topic and reading order.",
  path: "/series",
  cardType: "blog",
});

async function getSeriesData(): Promise<Series[]> {
  return (await listSeries()).map((series) => ({
    ...series,
    posts: series.posts.map((post) => ({
      slug: post.slug,
      title: post.title,
      description: post.description,
      date: post.date,
      image: post.image,
      seriesOrder: post.seriesOrder ?? 0,
    })),
  }));
}

export default async function SeriesPage() {
  const allSeries = await getSeriesData();
  return <SeriesPageClient allSeries={allSeries} />;
}
