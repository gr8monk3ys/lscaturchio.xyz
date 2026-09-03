"use client";

import { useRef, ReactNode } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { formatDate } from "@/lib/formatDate";
import { Container } from "../Container";
import { Heading } from "../Heading";
import { Prose } from "@/components/blog/Prose";
import { ArrowLeft } from "lucide-react";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { FallbackImage } from "@/components/ui/fallback-image";
import { ReadingProgress } from "./reading-progress";
import { NewsletterCTA } from "./newsletter-cta";
import { ViewCounter } from "./view-counter";
import { SocialShare } from "./social-share";
import { ReadingProgressTracker } from "./reading-progress-tracker";
import { BlogJsonLd } from "./blog-json-ld";
import { SyndicationLinks } from "./syndication-links";
import Link from "next/link";
import { getTopicHubsForTags } from "@/constants/topics";
import { getSiteUrl } from "@/lib/site-url";
import { clampBlogDateToToday } from "@/lib/blog-data";
import type { BlogStage } from "@/lib/blog-stage";
import { StageBadge } from "@/components/blog/stage-badge";

const TextToSpeech = dynamic(
  () => import("./text-to-speech").then((module) => module.TextToSpeech),
  { ssr: false, loading: () => null }
);

const SeriesNavigation = dynamic(
  () => import("./series-navigation").then((module) => module.SeriesNavigation),
  { ssr: false, loading: () => null }
);

const Webmentions = dynamic(
  () => import("./webmentions").then((module) => module.Webmentions),
  { ssr: false, loading: () => <EndMatterSkeleton label="From the open web" rows={1} /> }
);

const GiscusComments = dynamic(
  () => import("./giscus-comments").then((module) => module.GiscusComments),
  { ssr: false, loading: () => null }
);

const RelatedPosts = dynamic(
  () => import("./related-posts").then((module) => module.RelatedPosts),
  { ssr: false, loading: () => <EndMatterSkeleton label="Related" rows={2} /> }
);

const BlogSidebar = dynamic(
  () => import("./blog-sidebar").then((module) => module.BlogSidebar),
  { ssr: false, loading: () => null }
);

const EssayContentsInline = dynamic(
  () => import("./blog-sidebar").then((module) => module.EssayContentsInline),
  { ssr: false, loading: () => null }
);

const EssayAskInline = dynamic(
  () => import("./blog-sidebar").then((module) => module.EssayAskInline),
  { ssr: false, loading: () => null }
);

/** Reserves the end matter's space while its client-only blocks load. */
function EndMatterSkeleton({ label, rows }: { label: string; rows: number }) {
  return (
    <section className="mt-12 border-t border-border pt-6" aria-hidden>
      <span className="label-mono block">{label}</span>
      <div className="mt-4 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-4 w-full max-w-lg bg-muted/60" />
        ))}
      </div>
    </section>
  );
}

interface BlogMeta {
  title: string;
  description: string;
  date: string;
  updated?: string; // Optional last updated date
  image: string;
  tags: string[];
  syndication?: string[]; // Optional syndication links (Mastodon/Bluesky/etc.)
  series?: string; // Optional series name
  seriesOrder?: number; // Order within the series
  stage?: BlogStage;
}

interface BlogLayoutProps {
  children: ReactNode;
  meta: BlogMeta;
  isRssFeed?: boolean;
  previousPathname?: string;
  readingTime?: number;
}

export function BlogLayout({
  children,
  meta,
  isRssFeed = false,
  previousPathname,
  readingTime = 5,
}: BlogLayoutProps) {
  const pathname = usePathname();
  const contentRef = useRef<HTMLDivElement>(null);
  const safeDate = clampBlogDateToToday(meta.date);
  const safeUpdated = meta.updated ? clampBlogDateToToday(meta.updated) : undefined;
  const relatedHubs = getTopicHubsForTags(meta.tags);

  // Get slug from pathname
  const slug = pathname.split('/').pop() || '';

  if (isRssFeed) {
    return children;
  }

  // Canonical, never window.location: branching on `typeof window` here
  // desynced server and client rendering (hydration mismatch on every
  // non-canonical origin), and href would leak ?utm_source into the JSON-LD.
  const fullUrl = `${getSiteUrl()}${pathname}`;

  return (
    <>
      <ReadingProgress />
      <ReadingProgressTracker slug={slug} title={meta.title} tags={meta.tags} />
      <Container className="mt-8 lg:mt-16">
        <BlogJsonLd
          title={meta.title}
          description={meta.description}
          date={safeDate}
          updated={safeUpdated}
          image={meta.image}
          tags={meta.tags}
          url={fullUrl}
        />
      <div className="xl:relative xl:grid xl:grid-cols-[1fr_300px] xl:gap-8 xl:items-start">
        <div className="mx-auto max-w-2xl xl:mx-0">
          <BreadcrumbNav customSegments={{ blog: "Blog" }} />

          {previousPathname && (
            <button
              type="button"
              onClick={() => window.history.back()}
              aria-label="Go back to blogs"
              className="group mb-8 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md shadow-zinc-800/5 ring-1 ring-zinc-900/5 transition dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0 dark:ring-white/10 dark:hover:border-zinc-700 dark:hover:ring-white/20"
            >
              <ArrowLeft className="h-4 w-4 stroke-zinc-500 transition group-hover:stroke-zinc-700 dark:stroke-zinc-500 dark:group-hover:stroke-zinc-400" />
            </button>
          )}
          <article>
            <header className="flex flex-col">
              {/* Wall-label meta line: date · reading time · tags · views */}
              <div className="label-mono flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <time dateTime={safeDate}>{formatDate(safeDate)}</time>
                <span aria-hidden className="text-foreground/25">·</span>
                <span>{readingTime} min</span>
                {meta.tags.length > 0 && (
                  <>
                    <span aria-hidden className="text-foreground/25">·</span>
                    {meta.tags.map((tag, tagIndex) => (
                      <span key={tag} className="inline-flex items-center">
                        <Link
                          href={`/tag/${encodeURIComponent(tag)}`}
                          className="transition-colors hover:text-primary"
                        >
                          {tag}
                        </Link>
                        {tagIndex < meta.tags.length - 1 && (
                          <span aria-hidden className="ml-3 text-foreground/25">
                            ·
                          </span>
                        )}
                      </span>
                    ))}
                  </>
                )}
                {meta.stage && (
                  <>
                    <span aria-hidden className="text-foreground/25">·</span>
                    <StageBadge stage={meta.stage} />
                  </>
                )}
                <ViewCounter slug={slug} />
              </div>

              <Heading className="mt-5 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
                {meta.title}
              </Heading>

              <p className="mt-5 max-w-2xl text-xl leading-relaxed text-muted-foreground">
                {meta.description}
              </p>

              {safeUpdated && (
                <p className="label-mono mt-3">Updated {formatDate(safeUpdated)}</p>
              )}

              {/* Byline as a wall label: the reader who arrived mid-essay
                  should leave knowing who wrote it without hunting. */}
              <p className="label-mono mt-5 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="text-foreground">Lorenzo Scaturchio</span>
                <span aria-hidden className="text-foreground/25">·</span>
                <span>Los Angeles</span>
                <span aria-hidden className="text-foreground/25">·</span>
                <Link
                  href="/about"
                  className="text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                >
                  About the author →
                </Link>
              </p>

              {relatedHubs.length > 0 && (
                <p className="label-mono mt-5 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className="text-foreground/70">Explore</span>
                  {relatedHubs.map((hub) => (
                    <Link
                      key={hub.slug}
                      href={`/topics/${hub.slug}`}
                      className="text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                    >
                      {hub.title}
                    </Link>
                  ))}
                </p>
              )}

              <EssayContentsInline contentRef={contentRef} slug={slug} />

              <hr className="gallery-rule mt-8" />

              <div className="relative mt-8 aspect-video overflow-hidden border border-border bg-muted">
                <FallbackImage
                  src={meta.image}
                  alt={meta.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 672px"
                  className="object-cover"
                  priority
                />
              </div>
            </header>
            <div className="mt-8">
              {/* Listening is the one alternative that belongs before the
                  text. Sharing and subscribing wait until it has been read. */}
              <div className="mb-8">
                <TextToSpeech slug={slug} contentRef={contentRef} />
              </div>

              <Prose>
                <div ref={contentRef}>
                  {children}
                </div>
              </Prose>
            </div>

            {/* End matter: share and series first, as wall labels on one
                hairline, then the rest of the machinery. */}
            <footer className="mt-12 border-t border-border pt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <SocialShare
                  title={meta.title}
                  description={meta.description}
                  url={fullUrl}
                />
                {meta.syndication && meta.syndication.length > 0 && (
                  <SyndicationLinks links={meta.syndication} />
                )}
              </div>

              {meta.series && meta.seriesOrder && (
                <SeriesNavigation
                  seriesName={meta.series}
                  currentSlug={slug}
                  currentOrder={meta.seriesOrder}
                />
              )}
            </footer>

            {/* The reader's next step is another essay; everything else
                comes after it. */}
            <RelatedPosts
              currentTitle={meta.title}
              currentUrl={pathname}
            />

            <EssayAskInline slug={slug} title={meta.title} contentRef={contentRef} />

            <NewsletterCTA
              defaultTopics={relatedHubs.map((hub) => hub.slug)}
              sourcePath={pathname}
            />

            <Webmentions path={pathname} />

            <GiscusComments />
          </article>
        </div>

        {/* Sidebar (AI + TOC) - only visible on xl screens */}
        <BlogSidebar slug={slug} title={meta.title} contentRef={contentRef} />
      </div>
    </Container>
    </>
  );
}
