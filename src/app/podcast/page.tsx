import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { Paragraph } from "@/components/Paragraph";
import { Metadata } from "next";
import { Mic, Rss } from "lucide-react";
import Link from "next/link";
import { getAllBlogs } from "@/lib/getAllBlogs";
import { hasAudioForSlug } from "@/lib/audio";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Podcast | Lorenzo Scaturchio",
  description: "Audio versions of my writing. Subscribe via RSS.",
};

export default function PodcastPage() {
  const rssUrl = "/podcast/rss.xml";

  return (
    <Container className="mt-16 lg:mt-32">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 neu-card p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="neu-flat-sm rounded-xl p-3">
              <Mic className="h-8 w-8 text-primary" />
            </div>
            <Heading className="text-4xl font-bold">Podcast</Heading>
          </div>
          <Paragraph className="text-lg text-muted-foreground">
            Audio versions of my writing: AI, technology, philosophy, and building systems that ship cleanly.
          </Paragraph>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href={rssUrl}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 neu-button text-sm font-medium hover:text-primary transition-colors"
            >
              <Rss className="h-4 w-4 text-primary" />
              Subscribe via RSS
            </Link>
            <span className="text-sm text-muted-foreground">
              Works in Apple Podcasts, Overcast, Pocket Casts, and more.
            </span>
          </div>
        </div>

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
      <div className="neu-flat rounded-2xl p-8 text-center">
        <p className="text-muted-foreground">
          No audio episodes found yet. Check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Latest Episodes</h2>
        <p className="text-muted-foreground mt-1">
          Each episode is an audio version of a blog post.
        </p>
      </div>

      <div className="space-y-4">
        {episodes.map((post) => (
          <article key={post.slug} className="neu-card p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="min-w-0">
                <Link href={`/blog/${post.slug}`} className="group">
                  <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                </Link>
                <p className="text-sm text-muted-foreground mt-2">
                  {post.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {post.tags.slice(0, 5).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="shrink-0 text-sm text-muted-foreground">
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>

            <div className="mt-5">
              <audio
                controls
                preload="none"
                src={`/audio/${post.slug}.mp3`}
                className="w-full"
              />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
