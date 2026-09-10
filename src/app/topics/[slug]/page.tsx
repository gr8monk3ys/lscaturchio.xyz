import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Layers } from "lucide-react";

import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { Paragraph } from "@/components/Paragraph";
import { BlogCard } from "@/components/blog/BlogCard";
import { listRoutableProjects } from "@/lib/project-catalogue";
import { getAllBlogs } from "@/lib/getAllBlogs";
import { buildPageMetadata } from "@/lib/seo";
import { findTopicHub, TOPIC_HUBS } from "@/constants/topics";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams(): Array<{ slug: string }> {
  return TOPIC_HUBS.map((hub) => ({ slug: hub.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const hub = findTopicHub(slug);
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
  const hub = findTopicHub(slug);
  if (!hub) notFound();

  const blogs = await getAllBlogs();
  const posts = blogs
    .filter((blog) =>
      blog.tags.some((tag) => hub.tags.some((t) => t.toLowerCase() === tag.toLowerCase()))
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  const featuredProjectSlugs = new Set(hub.featuredProjects ?? []);
  const relatedProjects = listRoutableProjects().filter((project) =>
    featuredProjectSlugs.has(project.slug)
  );

  return (
    <Container className="mt-16 lg:mt-32" size="wide">
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

        {/* Hairline rows. This was a neu-card containing a grid of neu-flat-sm
            tiles — cards inside cards, the pattern the changelog roadmap was
            rebuilt to stop using. The green folder icon went with them; the
            wall label says what the section is. */}
        {relatedProjects.length > 0 && (
          <section className="border-t border-border pt-6">
            <span className="label-mono block">Featured projects</span>
            <ul className="mt-4">
              {relatedProjects.map((p) => (
                <li key={p.slug} className="border-b border-border last:border-b-0">
                  <Link
                    href={`/projects/${p.slug}`}
                    className="group block py-4 transition-colors"
                  >
                    <span className="block font-semibold transition-colors group-hover:text-primary">
                      {p.title}
                    </span>
                    <span className="mt-1 block text-sm text-muted-foreground line-clamp-2">
                      {p.description}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="space-y-4">
          <h2 className="text-section-title">Posts</h2>
          {posts.length === 0 ? (
            <div className="neu-card p-8 text-center">
              <p className="text-muted-foreground">
                No posts found for this topic yet.
              </p>
              <Link href="/blog" className="mt-4 inline-block px-6 py-2 rounded-xl cta-secondary">
                Browse all posts
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((blog) => (
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
          )}
        </section>
      </div>
    </Container>
  );
}
