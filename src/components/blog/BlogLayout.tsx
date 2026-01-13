"use client";

import React, { useRef, ReactNode } from "react";
import { motion } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { formatDate } from "../../../lib/formatDate";
import { Container } from "../Container";
import { Heading } from "../Heading";
import { Paragraph } from "../Paragraph";
import { Prose } from "@/components/blog/Prose";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { AdBanner } from "@/components/ads/AdBanner";
import { InArticleAd } from "@/components/ads/InArticleAd";
import { FallbackImage } from "@/components/ui/fallback-image";
import { ReadingProgress } from "./reading-progress";
import { ReadingTimeBadge } from "./reading-time-badge";
import { RelatedPosts } from "./related-posts";
import { GiscusComments } from "./giscus-comments";
import { TableOfContents } from "./table-of-contents";
import { NewsletterCTA } from "./newsletter-cta";
import { ViewCounter } from "./view-counter";
import { BlogReactions } from "./blog-reactions";
import { SocialShare } from "./social-share";
import { SeriesNavigation } from "./series-navigation";
import { ReadingProgressTracker } from "./reading-progress-tracker";
import { TextToSpeech } from "./text-to-speech";
import { BlogJsonLd } from "./blog-json-ld";

// Ad placement configuration - positions where in-article ads are injected
const AD_PLACEMENT = {
  FIRST_IN_ARTICLE_AFTER_PARAGRAPH: 3,
  SECOND_IN_ARTICLE_AFTER_PARAGRAPH: 8,
} as const;

interface BlogMeta {
  title: string;
  description: string;
  date: string;
  updated?: string; // Optional last updated date
  image: string;
  tags: string[];
  series?: string; // Optional series name
  seriesOrder?: number; // Order within the series
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
  const contentRef = useRef<HTMLDivElement>(null);

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

  return (
    <>
      <ReadingProgress />
      <ReadingProgressTracker slug={slug} />
      <Container className="mt-16 lg:mt-32">
        <BlogJsonLd
          title={meta.title}
          description={meta.description}
          date={meta.date}
          updated={meta.updated}
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
                      <time dateTime={meta.date} className="text-stone-600">
                        {formatDate(meta.date)}
                      </time>
                      {meta.updated && (
                        <span className="text-xs text-stone-500">
                          Updated: {formatDate(meta.updated)}
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
                        <span key={tag} className="text-stone-600">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <Heading className="mt-6 text-4xl font-bold tracking-tight text-stone-800 sm:text-5xl">
                  {meta.title}
                </Heading>
                <Paragraph className="mt-4 text-sm leading-8 text-stone-600">
                  {meta.description}
                </Paragraph>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-8 aspect-video relative overflow-hidden rounded-2xl bg-stone-100"
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
                <TextToSpeech contentRef={contentRef} />
                <SocialShare
                  title={meta.title}
                  description={meta.description}
                />
              </div>
              
              {/* Top of article ad */}
              <AdBanner slot="1234567890" format="horizontal" />
              <Prose>
                <div ref={contentRef}>
                  {/* Inject in-article ads at strategic positions */}
                  {React.Children.map(children, (child, index) => {
                    if (index === AD_PLACEMENT.FIRST_IN_ARTICLE_AFTER_PARAGRAPH) {
                      return (
                        <>
                          {child}
                          <InArticleAd slot="2345678901" />
                        </>
                      );
                    } else if (index === AD_PLACEMENT.SECOND_IN_ARTICLE_AFTER_PARAGRAPH) {
                      return (
                        <>
                          {child}
                          <InArticleAd slot="3456789012" />
                        </>
                      );
                    }
                    return child;
                  })}
                </div>
              </Prose>

              {/* Bottom of article ad */}
              <AdBanner slot="4567890123" format="horizontal" className="mt-8" />
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
            <NewsletterCTA />

            {/* Blog Reactions */}
            <div className="my-8 flex justify-center">
              <BlogReactions slug={slug} />
            </div>

            {/* Comments Section */}
            <GiscusComments />

            {/* Related Posts */}
            <RelatedPosts
              currentTitle={meta.title}
              currentUrl={pathname}
            />
          </article>
        </div>

        {/* Table of Contents - only visible on xl screens */}
        <TableOfContents />
      </div>
    </Container>
    </>
  );
}
