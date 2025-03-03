"use client";

import React, { useState, useEffect, useRef, ReactNode } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { formatDate } from "../../../lib/formatDate";
import { Container } from "../Container";
import { Heading } from "../Heading";
import { Paragraph } from "../Paragraph";
import { Prose } from "@/components/blog/Prose";
import { ArrowLeft, Share2, Calendar, Tag, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommentSection } from "@/components/ui/comment-section";
import Script from "next/script";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { AdBanner } from "@/components/ads/AdBanner";
import { InArticleAd } from "@/components/ads/InArticleAd";
import { FallbackImage } from "@/components/ui/fallback-image";

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
}

export function BlogLayout({
  children,
  meta,
  isRssFeed = false,
  previousPathname,
}: BlogLayoutProps) {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const newUtterance = new SpeechSynthesisUtterance();
      newUtterance.rate = 0.9;
      setUtterance(newUtterance);

      return () => {
        if (isPlaying) {
          window.speechSynthesis.cancel();
          setIsPlaying(false);
        }
      };
    }
  }, [isPlaying]);

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
    return children;
  }

  // Create JSON-LD structured data for the blog post
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": meta.title,
    "description": meta.description,
    "image": `https://lscaturchio.xyz${meta.image}`,
    "datePublished": meta.date,
    "author": {
      "@type": "Person",
      "name": "Lorenzo Scaturchio"
    },
    "publisher": {
      "@type": "Person",
      "name": "Lorenzo Scaturchio",
      "logo": {
        "@type": "ImageObject",
        "url": "https://lscaturchio.xyz/signature.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": typeof window !== 'undefined' ? window.location.href : ""
    },
    "keywords": meta.tags.join(", ")
  };

  return (
    <Container className="mt-16 lg:mt-32">
      <Script id="blog-schema" type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </Script>
      <div className="xl:relative">
        <div className="mx-auto max-w-2xl">
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
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <time dateTime={meta.date} className="text-stone-600">
                      {formatDate(meta.date)}
                    </time>
                  </div>
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
              <div className="flex justify-between items-center mb-8">
                <Button
                  onClick={handlePlay}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-4 w-4" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" /> Listen
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    navigator.share({
                      title: meta.title,
                      text: meta.description,
                      url: window.location.href,
                    });
                  }}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Share2 className="h-4 w-4" /> Share
                </Button>
              </div>
              
              {/* Top of article ad */}
              <AdBanner slot="1234567890" format="horizontal" />
              <Prose>
                <div ref={contentRef}>
                  {/* Inject in-article ad after the first few paragraphs */}
                  {React.Children.map(children, (child, index) => {
                    if (index === 3) { // After approximately 3 paragraphs
                      return (
                        <>
                          {child}
                          <InArticleAd slot="2345678901" />
                        </>
                      );
                    } else if (index === 8) { // After approximately 8 paragraphs
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-8"
            >
              {/* <CommentSection /> */}
            </motion.div>
          </article>
        </div>
      </div>
    </Container>
  );
}
