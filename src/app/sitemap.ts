import type { MetadataRoute } from "next";

import { getAllBlogs } from "@/lib/getAllBlogs";
import { products } from "@/constants/products";
import { TOPIC_HUBS } from "@/constants/topics";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://lscaturchio.xyz";

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;

function absolute(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

function parseIsoDate(date: string | undefined): Date | undefined {
  if (!date) return undefined;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return undefined;
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: Array<{
    path: string;
    changeFrequency: ChangeFrequency;
    priority: number;
  }> = [
    { path: "/", changeFrequency: "weekly", priority: 1.0 },
    { path: "/blog", changeFrequency: "weekly", priority: 0.9 },
    { path: "/projects", changeFrequency: "monthly", priority: 0.8 },
    { path: "/services", changeFrequency: "monthly", priority: 0.8 },
    { path: "/about", changeFrequency: "monthly", priority: 0.7 },
    { path: "/topics", changeFrequency: "weekly", priority: 0.6 },
    { path: "/tags", changeFrequency: "weekly", priority: 0.6 },
    { path: "/series", changeFrequency: "weekly", priority: 0.5 },
    { path: "/podcast", changeFrequency: "monthly", priority: 0.5 },
    { path: "/bookmarks", changeFrequency: "weekly", priority: 0.5 },
    { path: "/now", changeFrequency: "weekly", priority: 0.4 },
    { path: "/professional", changeFrequency: "monthly", priority: 0.4 },
    { path: "/testimonials", changeFrequency: "yearly", priority: 0.4 },
    { path: "/books", changeFrequency: "monthly", priority: 0.3 },
    { path: "/movies", changeFrequency: "monthly", priority: 0.3 },
    { path: "/photos", changeFrequency: "monthly", priority: 0.3 },
    { path: "/links", changeFrequency: "monthly", priority: 0.3 },
    { path: "/uses", changeFrequency: "yearly", priority: 0.3 },
    { path: "/contact", changeFrequency: "yearly", priority: 0.3 },
    { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.1 },
    { path: "/terms-of-service", changeFrequency: "yearly", priority: 0.1 },
    { path: "/stats", changeFrequency: "monthly", priority: 0.2 },
    { path: "/changelog", changeFrequency: "monthly", priority: 0.2 },
  ];

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: absolute(route.path),
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const blogs = await getAllBlogs();
  const blogEntries: MetadataRoute.Sitemap = blogs.map((blog) => ({
    url: absolute(`/blog/${blog.slug}`),
    lastModified: parseIsoDate(blog.updated) ?? parseIsoDate(blog.date) ?? now,
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  const tags = new Set<string>();
  blogs.forEach((blog) => {
    blog.tags.forEach((tag) => tags.add(tag));
  });
  const tagEntries: MetadataRoute.Sitemap = Array.from(tags)
    .sort((a, b) => a.localeCompare(b))
    .map((tag) => ({
      url: absolute(`/tag/${encodeURIComponent(tag)}`),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.3,
    }));

  const topicEntries: MetadataRoute.Sitemap = TOPIC_HUBS.map((hub) => ({
    url: absolute(`/topics/${hub.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.4,
  }));

  const projectEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: absolute(`/projects/${product.slug}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [
    ...staticEntries,
    ...topicEntries,
    ...tagEntries,
    ...blogEntries,
    ...projectEntries,
  ];
}

