import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Layers } from "lucide-react";

import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { Paragraph } from "@/components/Paragraph";
import { EssayRows } from "@/components/blog/essay-rows";
import { getBlogsInTheme } from "@/lib/getAllBlogs";
import { toBlogPreview } from "@/lib/blog-data";
import { buildPageMetadata } from "@/lib/seo";
import { BLOG_THEMES } from "@/lib/blog-themes";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams(): Array<{ slug: string }> {
  return BLOG_THEMES.map((hub) => ({ slug: hub.slug }))
}

function findHub(slug: string) {
  return BLOG_THEMES.find((theme) => theme.slug === slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const hub = findHub(slug);
  if (!hub) return {};

  return buildPageMetadata({
    title: `${hub.title} | Topics`,
    description: hub.description,
    path: `/topics/${slug}`,
    cardType: "blog",
  });
}

export const revalidate = 3600;

export default async function TopicHubPage({ params }: Props) {
  const { slug } = await params;
  const hub = findHub(slug);
  if (!hub) notFound();

  const posts = await getBlogsInTheme(hub.slug);

  return (
    <Container className="mt-4" size="wide">
      <div className="space-y-10">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Layers className="h-4 w-4 text-primary" />
            <Link href="/topics" className="hover:text-foreground transition-colors">
              Topics
            </Link>
            <ArrowRight className="h-4 w-4" />
            <span className="text-foreground">{hub.title}</span>
          </div>

          <Heading>{hub.title}</Heading>
          <Paragraph className="text-lg text-muted-foreground">{hub.description}</Paragraph>
        </div>

        <section className="space-y-4">
          <h2 className="text-section-title">Posts</h2>
          {/* Hairline rows. This section was a three-column grid of
              BlogCards; DESIGN.md assigns index pages "stacked rows separated
              by hairlines ... not tiled cards". (A "Featured projects" list
              sat above it, fed by a `featuredProjects` field no hub ever set,
              so it never rendered; it went with the TOPIC_HUBS table.) */}
          {posts.length === 0 ? (
            <p className="max-w-prose text-muted-foreground">
              Nothing filed here yet.{" "}
              <Link
                href="/blog"
                className="label-link text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
              >
                Browse all writing
              </Link>
              .
            </p>
          ) : (
            <EssayRows posts={posts.map(toBlogPreview)} />
          )}
        </section>
      </div>
    </Container>
  );
}
