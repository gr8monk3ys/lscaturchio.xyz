import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Section, SectionHeader } from "@/components/ui/Section";
import { cn } from "@/lib/utils";

type SelectedWritingPost = {
  title: string;
  description: string;
  date: string;
  slug: string;
  tags: string[];
  image?: string;
};

type SelectedWritingProps = {
  posts: SelectedWritingPost[];
  className?: string;
};

export function SelectedWriting({ posts, className }: SelectedWritingProps) {
  if (!posts.length) return null;

  return (
    <Section padding="default" size="wide" divider topDivider reveal={false} className={className}>
      <div>
        <SectionHeader
          title="Selected Writing"
          description="A few pieces worth starting with."
          action={
            <Link
              href="/blog"
              className="group inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              View all posts
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          }
        />

        <div className="relative">
          <div
            className={cn(
              "selected-writing-rail -mx-4 flex gap-4 overflow-x-auto px-4 pb-4",
              "scroll-px-4 snap-x snap-mandatory",
              "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            )}
          >
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className={cn(
                  "group selected-writing-card snap-start shrink-0",
                  "w-[86%] sm:w-[420px] md:w-[460px]"
                )}
              >
                <div
                  className="neu-card h-full overflow-hidden"
                >
                  <div className="relative h-56 overflow-hidden">
                    <Image
                      src={post.image || "/images/blog/default.webp"}
                      alt={post.title}
                      fill
                      className="selected-writing-media object-cover transition-transform duration-500 ease-out"
                      sizes="(max-width: 768px) 100vw, 460px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                    <div className="absolute left-4 top-4 flex flex-wrap gap-1.5">
                      {(post.tags || []).slice(0, 2).map((tag) => (
                        <div
                          key={tag}
                          className="rounded-full border border-white/20 bg-black/35 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md"
                        >
                          {tag}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 p-6">
                    <h3 className="text-xl font-semibold tracking-tight leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {post.description}
                    </p>
                    <div className="mt-1 flex items-center justify-between gap-4">
                      <div className="flex flex-wrap gap-1.5">
                        {(post.tags || []).slice(2, 5).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="border border-border/50 bg-muted/60 px-2 py-0.5 text-xs font-medium"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                        Read
                        <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-background to-transparent"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent"
            aria-hidden
          />
        </div>
      </div>
    </Section>
  );
}
