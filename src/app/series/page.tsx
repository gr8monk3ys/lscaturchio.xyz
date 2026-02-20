import type { Metadata } from "next";
import { ogCardUrl } from "@/lib/seo";
import { SeriesPageClient, type Series } from "@/components/pages/series-page-client";
import { getAllBlogs } from "@/lib/getAllBlogs";

export const metadata: Metadata = {
  title: "Blog Series",
  description:
    "Multi-part writing series from Lorenzo Scaturchio, organized by topic and reading order.",
  openGraph: {
    title: "Blog Series | Lorenzo Scaturchio",
    description: "Multi-part deep dives into complex topics.",
    images: [
      {
        url: ogCardUrl({
          title: "Blog Series",
          description: "Multi-part deep dives",
          type: "blog",
        }),
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog Series | Lorenzo Scaturchio",
    description: "Multi-part deep dives into complex topics.",
    images: [
      ogCardUrl({
        title: "Blog Series",
        description: "Multi-part deep dives",
        type: "blog",
      }),
    ],
  },
};

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
