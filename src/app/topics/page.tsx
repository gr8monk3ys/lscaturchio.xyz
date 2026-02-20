import type { Metadata } from "next";
import Link from "next/link";
import { Layers } from "lucide-react";

import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { Paragraph } from "@/components/Paragraph";
import { getAllBlogs } from "@/lib/getAllBlogs";
import { ogCardUrl } from "@/lib/seo";
import { TOPIC_HUBS } from "@/constants/topics";

export const metadata: Metadata = {
  title: "Topics | Lorenzo Scaturchio",
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
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="flex items-center gap-3">
          <Layers className="h-8 w-8 text-primary" />
          <Heading className="text-4xl font-bold">Topics</Heading>
        </div>

        <Paragraph className="text-lg text-muted-foreground">
          A small set of curated hubs that link related posts and projects. If you prefer raw tags, you can browse{" "}
          <Link href="/tags" className="text-primary hover:underline">
            all tags
          </Link>
          .
        </Paragraph>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {hubsWithCounts.map((hub) => (
            <Link
              key={hub.slug}
              href={`/topics/${hub.slug}`}
              className="group neu-card p-6 hover:-translate-y-0.5 transition-[transform,box-shadow,color,background-color]"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">
                  {hub.title}
                </h2>
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  {hub.count}
                </span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {hub.description}
              </p>
              <div className="mt-4 text-xs text-muted-foreground">
                Includes tags: {hub.tags.slice(0, 4).join(", ")}{hub.tags.length > 4 ? ", ..." : ""}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Container>
  );
}
