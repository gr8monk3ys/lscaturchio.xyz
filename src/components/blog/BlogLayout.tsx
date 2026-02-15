"use client";

import { useRef, ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { formatDate } from "../../../lib/formatDate";
import { Container } from "../Container";
import { Heading } from "../Heading";
import { Paragraph } from "../Paragraph";
import { Prose } from "@/components/blog/Prose";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { FallbackImage } from "@/components/ui/fallback-image";
import { ReadingProgress } from "./reading-progress";
import { ReadingTimeBadge } from "./reading-time-badge";
import { RelatedPosts } from "./related-posts";
import { GiscusComments } from "./giscus-comments";
import { BlogSidebar } from "./blog-sidebar";
import { NewsletterCTA } from "./newsletter-cta";
import { InlineNewsletterCTA } from "./inline-newsletter-cta";
import { ViewCounter } from "./view-counter";
import { SocialShare } from "./social-share";
import { SeriesNavigation } from "./series-navigation";
import { ReadingProgressTracker } from "./reading-progress-tracker";
import { TextToSpeech } from "./text-to-speech";
import { BlogJsonLd } from "./blog-json-ld";
import { Webmentions } from "./webmentions";
import { SyndicationLinks } from "./syndication-links";
import Link from "next/link";
import { getTopicHubsForTags } from "@/constants/topics";

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
}

function getTodayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function clampToToday(date: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }
  const today = getTodayIsoDate();
  return date > today ? today : date;
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
  const router = useRouter();
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const contentRef = useRef<HTMLDivElement>(null);
  const safeDate = clampToToday(meta.date);
  const safeUpdated = meta.updated ? clampToToday(meta.updated) : undefined;
  const relatedHubs = getTopicHubsForTags(meta.tags);

  // Get slug from pathname
  const slug = pathname.split('/').pop() || '';

  if (isRssFeed) {
    return children;
  }

  // Build full URL for JSON-LD
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lscaturchio.xyz';
  const fullUrl = typeof window !== 'undefined'
    ? window.location.href
    : `${siteUrl}${pathname}`;

  const shared = !reduceMotion && !!slug;

  return (
    <>
      <ReadingProgress />
      <ReadingProgressTracker slug={slug} title={meta.title} tags={meta.tags} />
      <Container className="mt-16 lg:mt-32">
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
            <motion.button
              type="button"
              onClick={() => router.back()}
              aria-label="Go back to blogs"
              className="group mb-8 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md shadow-zinc-800/5 ring-1 ring-zinc-900/5 transition dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0 dark:ring-white/10 dark:hover:border-zinc-700 dark:hover:ring-white/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="h-4 w-4 stroke-zinc-500 transition group-hover:stroke-zinc-700 dark:stroke-zinc-500 dark:group-hover:stroke-zinc-400" />
            </motion.button>
          )}
          <article>
            <header className="flex flex-col">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <div className="flex flex-col">
                      <time dateTime={safeDate} className="text-stone-600 dark:text-stone-400">
                        {formatDate(safeDate)}
                      </time>
                      {safeUpdated && (
                        <span className="text-xs text-stone-500 dark:text-stone-400">
                          Updated: {formatDate(safeUpdated)}
                        </span>
                      )}
                    </div>
                  </div>
                  <ReadingTimeBadge minutes={readingTime} />
                  <ViewCounter slug={slug} />
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    <div className="flex gap-2">
                      {meta.tags.map((tag) => (
                        <Link
                          key={tag}
                          href={`/tag/${encodeURIComponent(tag)}`}
                          className="text-stone-600 hover:text-primary dark:text-stone-400 dark:hover:text-primary transition-colors"
                        >
                          {tag}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
                <motion.div layoutId={shared ? `blog-title-${slug}` : undefined}>
                  <Heading className="mt-6 text-4xl font-bold tracking-tight text-stone-800 dark:text-stone-100 sm:text-5xl">
                    {meta.title}
                  </Heading>
                </motion.div>
                <Paragraph className="mt-4 text-sm leading-8 text-stone-600 dark:text-stone-400">
                  {meta.description}
                </Paragraph>
                {relatedHubs.length > 0 && (
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-stone-500 dark:text-stone-400">Explore:</span>
                    {relatedHubs.map((hub) => (
                      <Link
                        key={hub.slug}
                        href={`/topics/${hub.slug}`}
                        className="rounded-full bg-primary/10 px-3 py-1 text-primary hover:bg-primary/15 transition-colors"
                      >
                        {hub.title}
                      </Link>
                    ))}
                  </div>
                )}
              </motion.div>
              <motion.div
                layoutId={shared ? `blog-cover-${slug}` : undefined}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-8 aspect-video relative overflow-hidden rounded-2xl bg-stone-100 dark:bg-stone-800"
              >
                <FallbackImage
                  src={meta.image}
                  alt={meta.title}
                  fill
                  className="object-cover"
                  priority
                />
              </motion.div>
            </header>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <TextToSpeech slug={slug} contentRef={contentRef} />
                <SocialShare
                  title={meta.title}
                  description={meta.description}
                />
              </div>
              {meta.syndication && meta.syndication.length > 0 && (
                <div className="mb-8">
                  <SyndicationLinks links={meta.syndication} />
                </div>
              )}

              <InlineNewsletterCTA
                defaultTopics={relatedHubs.map((hub) => hub.slug)}
                sourcePath={pathname}
              />
              
              <Prose>
                <div ref={contentRef}>
                  {children}
                </div>
              </Prose>
            </motion.div>

            {/* Series Navigation (if part of a series) */}
            {meta.series && meta.seriesOrder && (
              <SeriesNavigation
                seriesName={meta.series}
                currentSlug={slug}
                currentOrder={meta.seriesOrder}
              />
            )}

            {/* Newsletter CTA */}
            <NewsletterCTA
              defaultTopics={relatedHubs.map((hub) => hub.slug)}
              sourcePath={pathname}
            />

            {/* Webmentions (likes/reposts/replies from the open web) */}
            <Webmentions path={pathname} />

            {/* Comments Section */}
            <GiscusComments />

            {/* Related Posts */}
            <RelatedPosts
              currentTitle={meta.title}
              currentUrl={pathname}
            />
          </article>
        </div>

        {/* Sidebar (AI + TOC) - only visible on xl screens */}
        <BlogSidebar slug={slug} title={meta.title} />
      </div>
    </Container>
    </>
  );
}
