import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site-url";

export type OgCardType = "default" | "blog" | "project";

export function absoluteUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

export function ogCardUrl(params: {
  title: string;
  description?: string;
  type?: OgCardType;
  /** Optional cover image (typically a blog cover). Prefer a site-relative path (e.g. `/images/...`). */
  cover?: string;
}): string {
  const url = new URL("/api/og", SITE_URL);
  url.searchParams.set("title", params.title);
  if (params.description) url.searchParams.set("description", params.description);
  if (params.type) url.searchParams.set("type", params.type);
  if (params.cover) url.searchParams.set("cover", params.cover);
  return url.toString();
}

export function buildBlogMetadata(meta: {
  title: string;
  description: string;
  image?: string;
}): Metadata {
  const title = meta.title;
  const description = meta.description;
  const imageUrl = ogCardUrl({ title, description, type: "blog", cover: meta.image });

  return {
    title,
    description,
    openGraph: {
      type: "article",
      title,
      description,
      images: [{ url: imageUrl }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export function buildProjectMetadata(meta: {
  title: string;
  description: string;
}): Metadata {
  const title = meta.title;
  const description = meta.description;
  const imageUrl = ogCardUrl({ title, description, type: "project" });

  return {
    title,
    description,
    openGraph: {
      type: "website",
      title,
      description,
      images: [{ url: imageUrl }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}
