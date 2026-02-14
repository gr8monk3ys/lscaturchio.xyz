import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Layers, FolderKanban } from "lucide-react";

import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { Paragraph } from "@/components/Paragraph";
import { BlogCard } from "@/components/blog/BlogCard";
import { products } from "@/constants/products";
import { getAllBlogs } from "@/lib/getAllBlogs";
import { ogCardUrl } from "@/lib/seo";
import { findTopicHub } from "@/constants/topics";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const hub = findTopicHub(slug);
  if (!hub) return {};

  const title = `${hub.title} | Topics | Lorenzo Scaturchio`;
  const description = hub.description;
  const image = ogCardUrl({ title: hub.title, description, type: "blog" });

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
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
  const relatedProjects = products
    .filter((p) => !!p.slug)
    .filter((p) => featuredProjectSlugs.has(p.slug!));

  return (
    <Container className="mt-16 lg:mt-32" size="large">
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

          <Heading className="text-4xl font-bold">{hub.title}</Heading>
          <Paragraph className="text-lg text-muted-foreground">{hub.description}</Paragraph>
        </div>

        {relatedProjects.length > 0 && (
          <section className="neu-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <FolderKanban className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Featured Projects</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProjects.map((p) => (
                <Link
                  key={p.slug}
                  href={`/projects/${p.slug}`}
                  className="neu-flat-sm rounded-xl p-4 hover:shadow-md transition-all"
                >
                  <div className="font-semibold">{p.title}</div>
                  <div className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {p.description}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Posts</h2>
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

