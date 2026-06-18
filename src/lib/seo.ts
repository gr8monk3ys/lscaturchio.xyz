import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site-url";

export type OgCardType = "default" | "blog" | "project";

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

export function buildBlogMetadata(
  meta: {
    title: string;
    description: string;
    image?: string;
  },
  /** Site-relative canonical path, e.g. `/blog/some-slug`. */
  path?: string,
): Metadata {
  const title = meta.title;
  const description = meta.description;
  const imageUrl = ogCardUrl({ title, description, type: "blog", cover: meta.image });

  return {
    title,
    description,
    ...(path ? { alternates: { canonical: path } } : {}),
    openGraph: {
      type: "article",
      title,
      description,
      ...(path ? { url: path } : {}),
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

export function buildProjectMetadata(
  meta: {
    title: string;
    description: string;
  },
  /** Site-relative canonical path, e.g. `/projects/some-slug`. */
  path?: string,
): Metadata {
  const title = meta.title;
  const description = meta.description;
  const imageUrl = ogCardUrl({ title, description, type: "project" });

  return {
    title,
    description,
    ...(path ? { alternates: { canonical: path } } : {}),
    openGraph: {
      type: "website",
      title,
      description,
      ...(path ? { url: path } : {}),
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

/**
 * Metadata for a standalone page (about, garden pages, etc.): generated OG
 * card, twitter card, and a canonical URL. Use this so every page ships a
 * social preview instead of a bare link.
 */
export function buildPageMetadata(meta: {
  title: string;
  description: string;
  /** Site-relative canonical path, e.g. `/books`. */
  path: string;
}): Metadata {
  const { title, description, path } = meta;
  const imageUrl = ogCardUrl({ title, description, type: "default" });

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      title,
      description,
      url: path,
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
