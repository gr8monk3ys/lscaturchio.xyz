import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://lscaturchio.xyz";

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
}): string {
  const url = new URL("/api/og", SITE_URL);
  url.searchParams.set("title", params.title);
  if (params.description) url.searchParams.set("description", params.description);
  if (params.type) url.searchParams.set("type", params.type);
  return url.toString();
}

export function buildBlogMetadata(meta: {
  title: string;
  description: string;
  image?: string;
}): Metadata {
  const title = meta.title;
  const description = meta.description;
  const imageUrl = meta.image ? absoluteUrl(meta.image) : ogCardUrl({ title, description, type: "blog" });

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

