import Link from "next/link";
import { LedgerHead, LedgerSection } from "@/components/ui/ledger-section";
import { StageBadge } from "@/components/blog/stage-badge";
import { formatDate } from "@/lib/formatDate";
import { groupByTheme } from "@/lib/blog-themes";
import type { BlogPreview } from "@/lib/blog-data";
import { spellCount, spellCountLower, pluralize } from "@/lib/spell-count";

/** Themes whose essays argue about people and power, as opposed to systems. */
const ARGUMENT_THEMES = ["power-institutions", "philosophy-self", "money-work"];
const ENGINEERING_THEME = "technology-attention";

export function WhatIThink({ posts }: { posts: BlogPreview[] }) {
  const byTheme = groupByTheme(posts);

  // Top three themes by volume; the homepage is a doorway, not the archive.
  const groups = [...byTheme].sort((a, b) => b.posts.length - a.posts.length).slice(0, 3);

  // Both numbers in the description are counted, not asserted. "Eighty-three
  // essays … three to one" was accurate the day it was typed and had no way to
  // stay accurate; the ratio in particular moves every time an essay is tagged.
  const countIn = (slugs: string[]) =>
    byTheme
      .filter((group) => slugs.includes(group.theme.slug))
      .reduce((sum, group) => sum + group.posts.length, 0);

  const engineering = countIn([ENGINEERING_THEME]);
  const ratio = engineering > 0 ? Math.round(countIn(ARGUMENT_THEMES) / engineering) : 0;

  return (
    <LedgerSection
      head={
        <>
          <LedgerHead
            index="01"
            eyebrow="What I think"
            title="Mostly arguments."
            description={`${spellCount(posts.length)} ${pluralize(
              posts.length,
              "essay"
            )}, grouped by what they are actually about. Politics, philosophy and economics outnumber the engineering ${spellCountLower(
              ratio
            )} to one.`}
          />
          <Link
            href="/blog"
            prefetch={false}
            className="label-mono label-link mt-8 inline-block text-foreground ink-underline hover:text-primary"
          >
            Read everything <span aria-hidden="true">→</span>
          </Link>
        </>
      }
    >
      <div className="space-y-10">
        {groups.map(({ theme, posts: themePosts }) => (
          <section key={theme.slug}>
            <div className="flex items-baseline justify-between gap-4 border-b border-border pb-2">
              {/* `text-section-title`, matching `scroll-case-studies.tsx:85`
                  two sections below — home's other `h3` — and matching
                  `ThemedBlogSections`, where the same theme name introduces
                  the same essays on `/blog`. At `text-subsection` (17.2rem/560)
                  this was the only `h3` on the page not at 34.56px, and it was
                  what made the row below it unfixable: an essay title on the
                  index ramp (20px) would have been LARGER than the theme
                  heading containing it. Raising the parent is what /blog
                  already does, and it is the half I missed when I first called
                  this arithmetically blocked. */}
              <h3 className="text-section-title">{theme.title}</h3>
              <span className="label-mono shrink-0">{themePosts.length}</span>
            </div>
            <ul className="mt-4 space-y-3">
              {themePosts.slice(0, 2).map((post) => (
                <li key={post.slug}>
                  <Link href={`/blog/${post.slug}`} prefetch={false} className="group block">
                    {/* The same wall label the `/blog` rows carry. The
                        identical essay was rendered here as title plus
                        description and on `/blog` as date, stage, title,
                        description — so a reader who met an essay on the home
                        page could not see the one thing the stage vocabulary
                        exists to tell them, and met a different row for the
                        same object one click later.

                        Separator glued to the item after it, as everywhere
                        else: a leading `·` cannot be orphaned at the end of a
                        wrapped line. */}
                    <span className="label-mono flex flex-wrap items-center gap-x-3 gap-y-1">
                      <time dateTime={post.date}>{formatDate(post.date)}</time>
                      {post.stage && (
                        <span className="inline-flex items-center gap-x-3">
                          <span aria-hidden className="text-foreground/25">·</span>
                          <StageBadge stage={post.stage} />
                        </span>
                      )}
                    </span>
                    {/* `h4.text-card-title`: the same 20px/620 Fraunces the
                        identical row uses on `/blog`, `/topics`, `/tag`,
                        `/garden` and `/lab`, and a heading so the rotor can
                        reach it. It was a `<span>` at 16px Instrument Sans —
                        body copy, in the body voice, for the one element the
                        section exists to let you choose between. `h4` because
                        the theme heading above it is an `h3`. */}
                    <h4 className="mt-1 text-card-title text-foreground group-hover:text-primary">
                      {post.title}
                    </h4>
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
