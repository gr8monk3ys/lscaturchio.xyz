"use client";
import Head from "next/head";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatDate } from "../../lib/formatDate";
import { Prose } from "@/components/Prose";
import { Container } from "./Container";
import { Heading } from "./Heading";
import Link from "next/link";
import { Paragraph } from "./Paragraph";
import { motion } from "framer-motion";
import { Share2, Clock, Calendar } from "lucide-react";

function ArrowLeftIcon(props: any) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path
        d="M7.25 11.25 3.75 8m0 0 3.5-3.25M3.75 8h8.5"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BlogLayout({
  children,
  meta,
  isRssFeed = false,
  previousPathname,
}: any) {
  let router = useRouter();

  if (isRssFeed) {
    return children;
  }

  const readingTime = Math.ceil(meta.content?.split(/\s+/).length / 200) || 5; // Assumes 200 words per minute

  return (
    <Container className="mt-16 lg:mt-32">
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <header className="relative flex flex-col items-center mb-10">
          <Link
            href="/blog"
            aria-label="Go back to articles"
            className="group absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md shadow-zinc-800/5 ring-1 ring-zinc-900/5 transition hover:ring-zinc-900/15 dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0 dark:hover:border-zinc-700"
          >
            <ArrowLeftIcon className="h-4 w-4 stroke-zinc-500 transition group-hover:stroke-zinc-700 dark:stroke-zinc-400 dark:group-hover:stroke-zinc-300" />
          </Link>

          {meta.image && (
            <div className="relative w-full aspect-[2/1] mb-8 overflow-hidden rounded-lg">
              <Image
                src={meta.image}
                alt={meta.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center text-center"
          >
            <Heading className="max-w-3xl mb-4">{meta.title}</Heading>
            
            <div className="flex items-center gap-6 text-sm text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <time dateTime={meta.date}>{formatDate(meta.date)}</time>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{readingTime} min read</span>
              </div>
            </div>

            {meta.description && (
              <Paragraph className="mt-4 max-w-2xl text-zinc-600 dark:text-zinc-400">
                {meta.description}
              </Paragraph>
            )}
          </motion.div>

          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => navigator.share({ 
                title: meta.title,
                text: meta.description,
                url: window.location.href
              })}
              className="flex items-center gap-2 rounded-full bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-700 ring-1 ring-zinc-900/5 transition hover:ring-zinc-900/15 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-700 dark:hover:ring-zinc-600"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </header>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="prose dark:prose-invert"
        >
          {children}
        </motion.div>
      </motion.article>
    </Container>
  );
}
