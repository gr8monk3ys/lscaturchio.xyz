import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { Paragraph } from "@/components/Paragraph";
import { getAllBlogs } from "@/lib/getAllBlogs";
import { ogCardUrl } from "@/lib/seo";
import { TOPIC_HUBS } from "@/constants/topics";

export const metadata: Metadata = {
  title: "Topics",
  description: "Topic hubs that organize posts and projects into bigger themes.",
  openGraph: {
    title: "Topics | Lorenzo Scaturchio",
    description: "Topic hubs that organize posts and projects into bigger themes.",
    images: [
      {
        url: ogCardUrl({
          title: "Topics",
          description: "Pillars, hubs, and collections",
          type: "blog",
        }),
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Topics | Lorenzo Scaturchio",
    description: "Pillars, hubs, and collections.",
    images: [ogCardUrl({ title: "Topics", description: "Pillars, hubs, and collections", type: "blog" })],
  },
};

export const revalidate = 3600;

export default async function TopicsPage() {
  const blogs = await getAllBlogs();

  const hubsWithCounts = TOPIC_HUBS.map((hub) => {
    const count = blogs.filter((blog) =>
      blog.tags.some((tag) => hub.tags.some((t) => t.toLowerCase() === tag.toLowerCase()))
    ).length;
    return { ...hub, count };
  }).sort((a, b) => b.count - a.count);

  return (
    <Container className="mt-16 lg:mt-32" size="large">
      <div className="max-w-5xl mx-auto">
        {/* Header — gallery masthead */}
        <header className="mb-12">
          <span className="label-mono block">Garden · Topics</span>
          <Heading className="mt-4 text-4xl font-bold md:text-5xl">Topics</Heading>
          <Paragraph className="mt-4 max-w-2xl text-lg text-muted-foreground">
            A small set of curated hubs that link related posts and projects.
          </Paragraph>
          <hr className="gallery-rule mt-8" />
        </header>

        <div className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
          {hubsWithCounts.map((hub) => (
            <Link
              key={hub.slug}
              href={`/topics/${hub.slug}`}
              className="group border-t border-border py-6 transition-colors"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">
                  {hub.title}
                </h2>
                <span className="label-mono shrink-0">{hub.count}</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {hub.description}
              </p>
              <p className="label-mono mt-4">
                {hub.tags.slice(0, 4).join("  ·  ")}{hub.tags.length > 4 ? "  ·  …" : ""}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </Container>
  );
}
