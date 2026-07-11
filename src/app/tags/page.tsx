import { permanentRedirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tags",
  description: "Browse blog posts by topic.",
};

export default function TagsPage() {
  permanentRedirect("/topics");
}
