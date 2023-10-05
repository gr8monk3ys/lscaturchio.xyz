import type { Metadata } from "next";
import { BookmarksPageClient } from "@/components/pages/bookmarks-page-client";
import { ogCardUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Bookmarks",
  description:
    "Saved blog posts from Lorenzo Scaturchio, stored locally in your browser for reading later.",
  openGraph: {
    title: "Bookmarks | Lorenzo Scaturchio",
    description: "Saved blog posts for reading later.",
    images: [
      {
        url: ogCardUrl({
          title: "Bookmarks",
          description: "Saved posts for later",
          type: "default",
        }),
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bookmarks | Lorenzo Scaturchio",
    description: "Saved blog posts for reading later.",
    images: [
      ogCardUrl({
        title: "Bookmarks",
        description: "Saved posts for later",
        type: "default",
      }),
    ],
  },
};

export default function BookmarksPage() {
  return <BookmarksPageClient />;
}
