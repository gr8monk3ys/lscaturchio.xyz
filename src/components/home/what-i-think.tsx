import Link from "next/link";
import { LedgerHead, LedgerSection } from "@/components/ui/ledger-section";
import { groupByTheme } from "@/lib/blog-themes";
import type { BlogPreview } from "@/lib/blog-data";

export function WhatIThink({ posts }: { posts: BlogPreview[] }) {
  // Top three themes by volume; the homepage is a doorway, not the archive.
  const groups = groupByTheme(posts)
    .sort((a, b) => b.posts.length - a.posts.length)
    .slice(0, 3);

  return (
    <LedgerSection
      head={
        <>
          <LedgerHead
            index="01"
            eyebrow="What I think"
            title="Mostly arguments."
            description="Eighty-three essays, grouped by what they are actually about. Politics, philosophy and economics outnumber the engineering three to one."
          />
          <Link
            href="/blog"
            prefetch={false}
            className="label-mono mt-8 inline-block text-foreground underline-offset-4 hover:text-primary hover:underline"
          >
            Read everything →
          </Link>
        </>
      }
    >
      <div className="space-y-10">
        {groups.map(({ theme, posts: themePosts }) => (
          <section key={theme.slug}>
            <div className="flex items-baseline justify-between gap-4 border-b border-border pb-2">
              <h3 className="text-lg font-semibold tracking-tight">{theme.title}</h3>
              <span className="label-mono shrink-0">{themePosts.length}</span>
            </div>
            <ul className="mt-4 space-y-3">
              {themePosts.slice(0, 2).map((post) => (
                <li key={post.slug}>
                  <Link href={`/blog/${post.slug}`} prefetch={false} className="group block">
                    <span className="font-semibold text-foreground group-hover:text-primary">
                      {post.title}
                    </span>
                    <span className="mt-1 block max-w-lg text-sm text-muted-foreground line-clamp-2">
                      {post.description}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </LedgerSection>
  );
}
