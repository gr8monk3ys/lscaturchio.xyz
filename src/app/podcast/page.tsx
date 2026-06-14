import { Container } from "@/components/Container";
import { buildPageMetadata } from "@/lib/seo";
import { Heading } from "@/components/Heading";
import { Paragraph } from "@/components/Paragraph";
import { Rss } from "lucide-react";
import Link from "next/link";
import { getAllBlogs } from "@/lib/getAllBlogs";
import { hasAudioForSlug } from "@/lib/audio";
import { getAudioUrl } from "@/lib/audio-url";

export const metadata = buildPageMetadata({
  title: "Podcast",
  description: "Audio versions of my writing. Subscribe via RSS.",
  path: "/podcast",
});

export default function PodcastPage() {
  const rssUrl = "/podcast/rss.xml";

  return (
    <Container className="mt-16 lg:mt-32">
      <div className="max-w-4xl mx-auto">
        {/* Header — gallery masthead */}
        <header className="mb-12">
          <span className="label-mono block">Garden · Audio</span>
          <Heading className="mt-4 text-4xl font-bold md:text-5xl">Podcast</Heading>
          <Paragraph className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Audio versions of my writing: AI, technology, philosophy, and building systems that ship cleanly.
          </Paragraph>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href={rssUrl}
              className="inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              <Rss className="h-4 w-4" />
              Subscribe via RSS
            </Link>
            <span className="text-sm text-muted-foreground">
              Works in Apple Podcasts, Overcast, Pocket Casts, and more.
            </span>
          </div>

          <hr className="gallery-rule mt-8" />
        </header>

        <Episodes />
      </div>
    </Container>
  );
}

async function Episodes() {
  const blogs = await getAllBlogs();
  const episodes = blogs
    .filter((b) => hasAudioForSlug(b.slug))
    .slice(0, 20);

  if (episodes.length === 0) {
    return (
      <p className="text-muted-foreground">
        No audio episodes found yet. Check back soon.
      </p>
    );
  }

  return (
    <div>
      <div>
        <h2 className="font-display text-2xl font-bold">Latest Episodes</h2>
        <p className="text-muted-foreground mt-1">
          Each episode is an audio version of a blog post.
        </p>
      </div>

      <div className="mt-8 divide-y divide-border border-y border-border">
        {episodes.map((post) => (
          <article key={post.slug} className="py-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="min-w-0">
                <Link href={`/blog/${post.slug}`} className="group">
                  <h3 className="font-display text-xl font-semibold group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                </Link>
                <p className="text-sm text-muted-foreground mt-2">
                  {post.description}
                </p>
                {post.tags.length > 0 && (
                  <p className="label-mono mt-3">
                    {post.tags.slice(0, 5).join("  ·  ")}
                  </p>
                )}
              </div>

              <span className="label-mono shrink-0">
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>

            <div className="mt-5">
              <audio
                controls
                preload="none"
                src={getAudioUrl(post.slug)}
                className="w-full"
              />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
