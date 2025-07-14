"use client";

// Rule: TypeScript Usage - Use TypeScript for all code
import React, { useState, useEffect, useRef, ReactNode } from "react";
import { MDXProvider } from "@/components/mdx/MDXProvider";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { formatDate } from "../../../lib/formatDate";
import { calculateReadingTime } from "@/lib/readingTime";
import { Container } from "../Container";
import { Heading } from "../Heading";
import { Paragraph } from "../Paragraph";
import { Prose } from "@/components/blog/Prose";
import { ArrowLeft, Share2, Calendar, Tag, Play, Pause, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
// CommentSection import removed - unused
import Script from "next/script";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
// Ad components removed to improve performance
import { FallbackImage } from "@/components/ui/fallback-image";
import { RelatedPosts } from "@/components/blog/RelatedPosts";
import { RelatedPost } from "@/lib/getRelatedPosts";
import { BlogJsonLd } from "@/components/seo/BlogJsonLd";
import { ReadingProgressBar } from "@/components/blog/ReadingProgressBar";
import { SocialShare } from "@/components/blog/SocialShare";
import { NewsletterForm } from "@/components/ui/newsletter-form";
import { TextToSpeech } from "@/components/blog/TextToSpeech";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { ReadingTimeBadge } from "@/components/blog/ReadingTimeBadge";
import { MobileTableOfContents } from "@/components/blog/MobileTableOfContents";
// Removed duplicate progress indicator import
import { PrintFriendly } from "@/components/blog/PrintFriendly";
import { ShareMenu } from "@/components/blog/ShareMenu";
import { WithMDXErrorBoundary } from "@/components/blog/MDXErrorBoundary";

interface BlogMeta {
  title: string;
  description: string;
  date: string;
  image: string;
  tags: string[];
}

interface BlogLayoutProps {
  children: ReactNode;
  meta: BlogMeta;
  isRssFeed?: boolean;
  previousPathname?: string;
  content?: string;
  relatedPosts?: RelatedPost[];
  slug?: string;
}

export function BlogLayout({
  children,
  meta,
  isRssFeed = false,
  previousPathname,
  content,
  relatedPosts = [],
  slug = "",
}: BlogLayoutProps): JSX.Element {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [readingTime, setReadingTime] = useState({ text: "" });

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const newUtterance = new SpeechSynthesisUtterance();
      newUtterance.rate = 0.9;
      setUtterance(newUtterance);

      return () => {
        window.speechSynthesis.cancel();
      };
    }
  }, []);

  useEffect(() => {
    if (contentRef.current) {
      const textContent = content || contentRef.current.textContent || '';
      const calculatedReadingTime = calculateReadingTime(textContent);
      setReadingTime(calculatedReadingTime);
    }
  }, [content]);

  const handlePlay = () => {
    if (!contentRef.current || !utterance) return;

    if (!isPlaying) {
      utterance.text = contentRef.current.textContent || "";
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    } else {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  if (isRssFeed) {
    return <>{children}</>;
  }

  // Get the current URL for structured data
  const currentUrl = typeof window !== 'undefined' ? window.location.href : "";

  return (
    <>
      {/* Top reading progress bar - using a single consistent indicator */}
      <ReadingProgressBar targetSelector="article" color="#3e4c59" height={3} />
      <Container className="mt-16 lg:mt-32">
            <BlogJsonLd 
        title={meta.title}
        description={meta.description}
        datePublished={meta.date}
        images={[`https://lscaturchio.xyz${meta.image}`]}
        url={currentUrl}
        tags={meta.tags}
        readingTime={readingTime.text}
      />
        <div className="xl:relative">
          <div className="mx-auto max-w-2xl lg:max-w-5xl lg:grid lg:grid-cols-4 lg:gap-8">
            {/* Table of Contents sidebar - only shown on larger screens */}
            <div className="hidden lg:block lg:col-span-1 lg:sticky lg:top-24 lg:self-start h-fit">
              <TableOfContents contentSelector="#blog-content" maxDepth={3} minItems={2} />
            </div>
            
            {/* Main content */}
            <div className="lg:col-span-3">
              <BreadcrumbNav customSegments={{ blog: "Blog" }} />
          
          {previousPathname && (
            <motion.button
              type="button"
              onClick={() => router.back()}
              aria-label="Go back to blogs"
              className="group mb-8 flex h-10 w-10 items-center justify-center rounded-lg bg-stone-50 dark:bg-stone-800 shadow-[2px_2px_5px_rgba(0,0,0,0.05),-2px_-2px_5px_rgba(255,255,255,0.8)] dark:shadow-[2px_2px_5px_rgba(0,0,0,0.2),-1px_-1px_3px_rgba(255,255,255,0.05)] hover:shadow-[1px_1px_3px_rgba(0,0,0,0.1),-1px_-1px_3px_rgba(255,255,255,0.9)] dark:hover:shadow-[1px_1px_3px_rgba(0,0,0,0.3),-0.5px_-0.5px_2px_rgba(255,255,255,0.06)] transition-all transform active:scale-95"
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
                <div className="flex items-center text-sm font-space-mono text-stone-600 dark:text-stone-400 mb-6 gap-3 flex-wrap">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1.5" />
                    <span>{formatDate(meta.date)}</span>
                  </div>
                  <ReadingTimeBadge readingTime={readingTime.text} size="sm" />
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    <div className="flex gap-2">
                      {meta.tags.map((tag) => (
                        <span key={tag} className="text-stone-600 dark:text-stone-400 font-space-mono">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <Heading className="mt-6 text-4xl font-space-mono font-bold tracking-tight text-stone-800 dark:text-stone-100 sm:text-5xl">
                  {meta.title}
                </Heading>
                <Paragraph className="mt-4 text-sm font-space-mono leading-8 text-stone-600 dark:text-stone-400">
                  {meta.description}
                </Paragraph>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-8 aspect-video relative overflow-hidden rounded-lg bg-stone-50 dark:bg-stone-800 shadow-[5px_5px_15px_rgba(0,0,0,0.08),-5px_-5px_15px_rgba(255,255,255,0.9)] dark:shadow-[5px_5px_15px_rgba(0,0,0,0.4),-5px_-5px_15px_rgba(255,255,255,0.03)]"
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
              <div className="mb-8">
                <WithMDXErrorBoundary fallback={<div className="p-4 rounded-md bg-stone-100 dark:bg-stone-800 text-sm font-space-mono">Audio player unavailable</div>}>
                  <TextToSpeech 
                    content={content || contentRef.current?.textContent || ''} 
                    title={meta.title} 
                  />
                </WithMDXErrorBoundary>
              </div>
              
              {/* Top of article ad */}
              {/* Ad banner removed for performance */}
              <Prose>
                <div ref={contentRef}>
                  <MDXProvider>
                    {/* Inject in-article ad after the first few paragraphs */}
                    {React.Children.map(children, (child, index) => {
                      if (index === 3) { // After approximately 3 paragraphs
                        return (
                          <>
                            {child}
                            {/* In-article ad removed for performance */}
                          </>
                        );
                      } else if (index === 8) { // After approximately 8 paragraphs
                        return (
                          <>
                            {child}
                            {/* In-article ad removed for performance */}
                          </>
                        );
                      }
                      return child;
                    })}
                  </MDXProvider>
                </div>
              </Prose>
              
              {/* Bottom of article ad */}
              {/* Bottom ad banner removed for performance */}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-8"
            >
              {/* <CommentSection /> */}
            </motion.div>
            
            {/* Related Posts Section */}
            {relatedPosts && relatedPosts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <RelatedPosts posts={relatedPosts || []} currentSlug={slug} />
              </motion.div>
            )}
            
            {/* Social sharing and newsletter */}
            <div className="mt-16 space-y-8">
              <SocialShare 
                title={meta.title}
                url={currentUrl}
                description={meta.description}
              />
              
              <NewsletterForm />
            </div>
          </article>
        </div>
            
            {/* Sidebar content */}
            <div className="hidden lg:block">
              <div className="sticky top-8 space-y-6">
                <TableOfContents 
                  contentSelector=".prose" 
                  maxDepth={3} 
                  className="mb-6" 
                />
                
                <div className="rounded-lg neu-card bg-stone-50 dark:bg-stone-800 p-4 border-none">
                  <h3 className="font-medium text-stone-800 dark:text-stone-200 mb-3">Published</h3>
                  <div className="text-sm text-stone-600 dark:text-stone-400">
                    {formatDate(meta.date)}
                  </div>
                </div>
                
                {meta.tags.length > 0 && (
                  <div className="rounded-lg neu-card bg-stone-50 dark:bg-stone-800 p-4 border-none">
                    <h3 className="font-medium text-stone-800 dark:text-stone-200 mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {meta.tags.map(tag => (
                        <a
                          key={tag}
                          href={`/blog/tag/${encodeURIComponent(tag.toLowerCase())}`}
                          className="inline-flex items-center rounded-lg bg-stone-100 dark:bg-stone-700 px-2.5 py-1 text-xs text-stone-700 dark:text-stone-300 shadow-[1px_1px_2px_rgba(0,0,0,0.05),-1px_-1px_2px_rgba(255,255,255,0.6)] dark:shadow-[1px_1px_2px_rgba(0,0,0,0.2),-1px_-1px_2px_rgba(255,255,255,0.04)] hover:shadow-[2px_2px_3px_rgba(0,0,0,0.1),-2px_-2px_3px_rgba(255,255,255,0.7)] dark:hover:shadow-[2px_2px_3px_rgba(0,0,0,0.3),-2px_-2px_3px_rgba(255,255,255,0.05)] transition-all"
                        >
                          {tag}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-6 rounded-lg neu-card bg-stone-50 dark:bg-stone-800 p-4 border-none">
                  <h3 className="font-medium text-stone-800 dark:text-stone-200 mb-3">Share & Print</h3>
                  <div className="flex flex-wrap gap-2">
                    <PrintFriendly 
                      title={meta.title}
                      date={meta.date}
                      url={currentUrl}
                      contentSelector="#blog-content"
                    />
                    <ShareMenu 
                      title={meta.title}
                      description={meta.description}
                      url={currentUrl}
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
      
      {/* Article progress indicator */}
      {/* Removed duplicate progress indicator */}
    </>);
  }

