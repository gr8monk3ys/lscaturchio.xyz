import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogLayout } from "@/components/blog/BlogLayout";
import { loadEssayContent } from "@/lib/essay-content";
import { getAllBlogs, getBlogPost } from "@/lib/getAllBlogs";
import { buildBlogMetadata } from "@/lib/seo";

/**
 * Every essay, from one route.
 *
 * The slug resolves to the catalogue's `BlogPost` — metadata, clamped dates,
 * reading time, default cover — and `content.mdx` is imported only for its
 * body. There used to be a generated 13-line `page.tsx` beside each essay that
 * imported the MDX's raw `meta` and handed it to the layout, which then
 * re-derived the date clamp and looked the reading time back up by slug.
 *
 * Scheduled essays (front-matter date in the future) are prerendered and
 * routable at their URL, as they were under the per-essay shells: the URL is
 * shareable for review before the date, while every listing, the feed and the
 * sitemap leave the essay out until it goes live. That is why the params come
 * from `includeScheduled`.
 *
 * Any slug not in the catalogue is a 404 (`dynamicParams = false`), including
 * a folder whose meta has no title or date.
 */
export const dynamicParams = false;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const posts = await getAllBlogs({ includeScheduled: true });
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();
  return buildBlogMetadata(post, `/blog/${slug}`);
}

export default async function EssayPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();

  const Content = await loadEssayContent(slug);
  return (
    <BlogLayout post={post}>
      <Content />
    </BlogLayout>
  );
}
