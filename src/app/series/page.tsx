import type { Metadata } from "next";
import { ogCardUrl } from "@/lib/seo";
import { SeriesPageClient } from "@/components/pages/series-page-client";

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

export default function SeriesPage() {
  return <SeriesPageClient />;
}
