"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatDate } from "../../../lib/formatDate";
import { Container } from "../Container";
import { Heading } from "../Heading";
import { Paragraph } from "../Paragraph";
import { Prose } from "@/components/blog/Prose";
import { ArrowLeft, Share2, Clock, Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommentSection } from "@/components/ui/comment-section";

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

  const readingTime = Math.ceil(meta.content?.split(/\s+/).length / 200) || 5;

  return (
    <Container className="mt-16 lg:mt-32">
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative mx-auto max-w-6xl"
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <Button
            variant="outline"
            className="group flex items-center gap-2"
            onClick={() => router.push('/blog')}
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Blog
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,_1fr)_300px]">
          <div className="flex flex-col space-y-8">
            {meta.image && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative aspect-[2/1] w-full overflow-hidden rounded-2xl"
              >
                <Image
                  src={meta.image}
                  alt={meta.title}
                  fill
                  className="object-cover"
                  priority
                />
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col space-y-4"
            >
              <Heading className="max-w-3xl">{meta.title}</Heading>
              
              <div className="flex flex-wrap items-center gap-4 text-base text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <time dateTime={meta.date}>{formatDate(meta.date)}</time>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{readingTime} min read</span>
                </div>
                {meta.tags && (
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    <div className="flex flex-wrap gap-2">
                      {meta.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="rounded-full bg-zinc-100 px-3.5 py-1.5 text-sm font-medium dark:bg-zinc-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {meta.description && (
                <Paragraph className="max-w-2xl text-zinc-600 dark:text-zinc-400">
                  {meta.description}
                </Paragraph>
              )}
            </motion.div>

            <Prose>{children}</Prose>
            
            {/* Comment Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <CommentSection postId={meta.title} />
            </motion.div>
          </div>

          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="hidden lg:block"
          >
            <div className="sticky top-8 space-y-6">
              <div className="rounded-2xl border border-zinc-100 p-6 dark:border-zinc-700/40">
                <h2 className="flex items-center text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </h2>
                <div className="mt-4 flex flex-col space-y-2">
                  <button
                    onClick={() => navigator.share({ 
                      title: meta.title,
                      text: meta.description,
                      url: window.location.href
                    })}
                    className="flex items-center justify-center gap-2 rounded-lg border border-zinc-100 px-4 py-2 text-base text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700/40 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    Share this article
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                    }}
                    className="flex items-center justify-center gap-2 rounded-lg border border-zinc-100 px-4 py-2 text-base text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700/40 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    Copy link
                  </button>
                </div>
              </div>
            </div>
          </motion.aside>
        </div>
      </motion.article>
    </Container>
  );
}
