import { Container } from "@/components/Container";
import { buildPageMetadata } from "@/lib/seo";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { nowData, getNowFreshness } from "@/lib/now-data";
import { getCurrentlyReading } from "@/lib/goodreads";
import { getRecentWatches } from "@/lib/letterboxd";
import { getAllBlogs } from "@/lib/getAllBlogs";
import { getPublishedBlogs, sortBlogsByDateDescending } from "@/lib/blog-data";
import { PageHead } from "@/components/ui/page-head";

export const metadata = buildPageMetadata({
  title: "Now",
  description: "What I'm currently building, reading, watching, and thinking about.",
  path: "/now",
});

// Re-evaluate the staleness banner at least daily without a rebuild.
export const revalidate = 86400;

export default async function NowPage() {
  const { isStale, daysSinceUpdate } = getNowFreshness();
  const monthsSinceUpdate = Math.floor(daysSinceUpdate / 30);

  // These three read straight from the data exports and the blog, so they stay
  // current whether or not the hand-written sections above have been reviewed.
  const reading = getCurrentlyReading();
  const watching = getRecentWatches(5);
  const recentPosts = sortBlogsByDateDescending(getPublishedBlogs(await getAllBlogs())).slice(0, 4);

  return (
    <Container className="mt-16 lg:mt-32">
      <div className="max-w-3xl mx-auto">
        {/* Header — gallery masthead */}
        <PageHead
          className="mb-12"
          kicker="Garden · Now"
          title={<>What I&apos;m Doing Now</>}
          blurb={
            <>
              A snapshot of current focus, in the sense of{" "}
              <a
                href="https://nownownow.com/about"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                nownownow.com
              </a>
              . Reading, watching, and writing below are read from my actual logs rather than
              retyped, so they are right even when the rest of this page is overdue. Reviewed{" "}
              <span className="font-medium text-foreground">{nowData.lastUpdatedLabel}</span>.
            </>
          }
        >
          {isStale && (
            <div
              role="status"
              className="mt-6 flex items-start gap-3 border-l-2 border-primary pl-4 text-sm text-muted-foreground"
            >
              <AlertTriangle className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <span>
                Heads up: the hand-written parts of this snapshot are about {monthsSinceUpdate}{" "}
                months old. I keep this honest rather than pretending otherwise.
              </span>
            </div>
          )}
        </PageHead>

        {/* Location */}
        <section className="mb-16">
          <h2 className="font-display text-2xl font-semibold tracking-tight mb-4">Location</h2>
          <p className="text-muted-foreground leading-relaxed">
            Currently based in{" "}
            <span className="font-medium text-foreground">{nowData.location.label}</span>,{" "}
            {nowData.location.detail}
          </p>
        </section>

        {/* Building */}
        <section className="mb-16">
          <h2 className="font-display text-2xl font-semibold tracking-tight mb-6">Building</h2>
          <div className="divide-y divide-border border-y border-border">
            {nowData.building.map((item) => (
              <div key={item.title} className="py-6">
                <Link
                  href={item.href}
                  className="font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
                >
                  {item.title}
                </Link>
                <p className="mt-2 text-muted-foreground">{item.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Reading — live from the Goodreads export */}
        {reading.length > 0 && (
          <section className="mb-16">
            <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-2xl font-semibold tracking-tight">Reading</h2>
              <Link href="/books" className="label-mono hover:text-primary">
                All books →
              </Link>
            </div>
            <ul className="divide-y divide-border border-y border-border">
              {reading.map((book) => (
                <li key={book.id} className="flex flex-wrap items-baseline justify-between gap-x-4 py-4">
                  <a
                    href={book.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:text-primary"
                  >
                    {book.title}
                  </a>
                  <span className="text-sm text-muted-foreground">{book.author}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Watching — live from the Letterboxd diary */}
        {watching.length > 0 && (
          <section className="mb-16">
            <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-2xl font-semibold tracking-tight">Last watched</h2>
              <Link href="/movies" className="label-mono hover:text-primary">
                All films →
              </Link>
            </div>
            <ul className="divide-y divide-border border-y border-border">
              {watching.map((movie) => (
                <li
                  key={`${movie.title}-${movie.year}`}
                  className="flex flex-wrap items-baseline justify-between gap-x-4 py-4"
                >
                  <a
                    href={movie.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:text-primary"
                  >
                    {movie.title} <span className="label-mono">{movie.year}</span>
                  </a>
                  {movie.rating ? (
                    <span
                      className="text-sm text-primary"
                      aria-label={`${movie.rating} out of 5 stars`}
                    >
                      {"★".repeat(Math.floor(movie.rating)) + (movie.rating % 1 !== 0 ? "½" : "")}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Writing — live from the blog */}
        {recentPosts.length > 0 && (
          <section className="mb-16">
            <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-2xl font-semibold tracking-tight">Writing</h2>
              <Link href="/blog" className="label-mono hover:text-primary">
                All posts →
              </Link>
            </div>
            <ul className="divide-y divide-border border-y border-border">
              {recentPosts.map((post) => (
                <li key={post.slug} className="py-4">
                  <Link href={`/blog/${post.slug}`} className="font-medium hover:text-primary">
                    {post.title}
                  </Link>
                  {post.description ? (
                    <p className="mt-1 text-sm text-muted-foreground">{post.description}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Thinking About */}
        <section className="mb-16">
          <h2 className="font-display text-2xl font-semibold tracking-tight mb-6">
            Thinking about
          </h2>
          <ul className="space-y-3 text-muted-foreground">
            {nowData.thinkingAbout.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-primary mt-1">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Footer */}
        <div className="border-t border-border pt-8">
          <p className="text-sm text-muted-foreground">
            This page follows Derek Sivers&apos;{" "}
            <a
              href="https://sive.rs/nowff"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              /now page movement
            </a>
            . It is a short answer to what I am focused on, not a complete list of everything I
            could be doing.
          </p>
          <p className="text-sm text-muted-foreground mt-3">
            Want to collaborate on something?{" "}
            <Link href="/contact" className="text-primary hover:underline">
              Get in touch
            </Link>
            .
          </p>
        </div>
      </div>
    </Container>
  );
}
