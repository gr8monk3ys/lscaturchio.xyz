import { cache } from "react";

import { getAllBlogs } from "@/lib/getAllBlogs";
import { getBlogStats } from "@/lib/blog-data";

import { BlogStats } from "./blog-stats";

const getArchiveStats = cache(async () => {
  const blogs = await getAllBlogs();
  return getBlogStats(blogs);
});

export async function BlogArchiveStats() {
  const stats = await getArchiveStats();

  return <BlogStats stats={stats} />;
}
