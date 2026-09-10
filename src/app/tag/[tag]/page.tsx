import type { Metadata } from "next";
import Link from "next/link";
import { permanentRedirect } from "next/navigation";

import { Container } from "@/components/Container";
import { PageHead } from "@/components/ui/page-head";
import { BlogCard } from "@/components/blog/BlogCard";
import { getAllBlogs } from "@/lib/getAllBlogs";
import { spellCount, pluralize } from "@/lib/spell-count";
import { buildPageMetadata } from "@/lib/seo";

type Props = {
  params: Promise<{ tag: string }>;
};

export async function generateStaticParams(): Promise<Array<{ tag: string }>> {
  const blogs = await getAllBlogs()
  const tags = new Set(blogs.flatMap((blog) => blog.tags))
  return Array.from(tags).map((tag) => ({ tag }))
}

function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const raw = (await params).tag;
  const tag = safeDecodeURIComponent(raw);

  // The root layout's title template already appends the site name; adding it
  // here too produced "Tag: x | Lorenzo Scaturchio | Lorenzo Scaturchio".
  return buildPageMetadata({
    title: `Tag: ${tag}`,
    description: `Blog posts tagged with "${tag}".`,
    path: `/tag/${encodeURIComponent(tag)}`,
    cardType: "blog",
  });
}

export const revalidate = 3600;

export default async function TagPage({ params }: Props) {
  const raw = (await params).tag;
  const tag = safeDecodeURIComponent(raw);

  const blogs = await getAllBlogs();
  const filtered = blogs.filter((blog) =>
    blog.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
  );

  // Retired or unknown tags (the 2026-08 consolidation dropped ~120 tags used
  // by one or two posts) redirect to the index instead of serving a thin page.
  if (filtered.length === 0) {
    permanentRedirect("/tags");
  }

  return (
    <Container className="mt-16 lg:mt-32" size="wide">
      <PageHead
        className="mb-12"
        kicker="Writing · Tag"
        title={tag}
        blurb={`${spellCount(filtered.length)} ${pluralize(
          filtered.length,
          "post"
        )} ${filtered.length === 1 ? "carries" : "carry"} this tag.`}
      >
        <nav
          className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3"
          aria-label={`Leave the ${tag} tag`}
        >
          <Link
            href="/topics"
            className="label-mono label-link text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            Browse topics
          </Link>
          <Link
            href="/blog"
            className="label-mono label-link text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            All writing
          </Link>
        </nav>
      </PageHead>

      {/* No empty branch: a tag with no posts redirected to /tags above, so the
          only state this page can reach is a populated one. */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((blog) => (
          <BlogCard
            key={blog.slug}
            slug={blog.slug}
            title={blog.title}
            description={blog.description}
            date={blog.date}
            image={blog.image}
            tags={blog.tags}
          />
        ))}
      </div>
    </Container>
  );
}
