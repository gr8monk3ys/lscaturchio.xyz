import type { Metadata } from "next";
import { SeriesPageClient, type Series } from "@/components/pages/series-page-client";
import { getAllBlogs } from "@/lib/getAllBlogs";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Blog Series",
  description:
    "Multi-part writing series from Lorenzo Scaturchio, organized by topic and reading order.",
  path: "/series",
  cardType: "blog",
});

async function getSeriesData(): Promise<Series[]> {
  const blogs = await getAllBlogs();
  const seriesMap = new Map<string, Series["posts"]>();

  blogs.forEach((blog) => {
    if (!blog.series || !blog.seriesOrder) return;

    if (!seriesMap.has(blog.series)) {
      seriesMap.set(blog.series, []);
    }

    seriesMap.get(blog.series)!.push({
      slug: blog.slug,
      title: blog.title,
      description: blog.description,
      date: blog.date,
      image: blog.image,
      seriesOrder: blog.seriesOrder,
    });
  });

  const allSeries = Array.from(seriesMap.entries()).map(([name, posts]) => {
    const sortedPosts = posts.sort((a, b) => a.seriesOrder - b.seriesOrder);
    return {
      name,
      posts: sortedPosts,
      totalPosts: sortedPosts.length,
      totalReadingTime: sortedPosts.length * 5,
    };
  });

  return allSeries.sort((a, b) => b.totalPosts - a.totalPosts);
}

export default async function SeriesPage() {
  const allSeries = await getSeriesData();
  return <SeriesPageClient allSeries={allSeries} />;
}
