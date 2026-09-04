import type { Metadata } from "next";
import { BookmarksPageClient } from "@/components/pages/bookmarks-page-client";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Bookmarks",
  description:
    "Saved blog posts from Lorenzo Scaturchio, stored locally in your browser for reading later.",
  path: "/bookmarks",
});

export default function BookmarksPage() {
  return <BookmarksPageClient />;
}
