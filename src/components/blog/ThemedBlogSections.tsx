import Link from "next/link";

import { groupByTheme } from "@/lib/blog-themes";
import type { BlogPreview } from "@/lib/blog-data";
import { formatDate } from "@/lib/formatDate";
import { StageBadge } from "@/components/blog/stage-badge";

// BlogPreview already carries slug/title/description/tags; declaring a local
// structural type here would silently drift from it.
export function ThemedBlogSections({ posts }: { posts: BlogPreview[] }) {
  const groups = groupByTheme(posts);

  return (
    <div className="space-y-14">
      {groups.map(({ theme, posts: themePosts }) => (
        <section key={theme.slug} aria-labelledby={`theme-${theme.slug}`}>
          <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
            {/* `text-section-title`, which is what this actually is.
                Two wrong answers preceded it. Originally the group was
                `text-card-title` while its essays were 16px sans spans — the
                shelf louder than the books. Dropping the group to
                `text-subsection` fixed that inversion and created another: it
                became the quietest heading on a page where it divides 84
                essays into five sections, which a third review duly caught.
                The real problem was never the group's size, it was that the
                titles were not headings. Now that they are `h3` at
                `text-card-title`, the ordinary hierarchy works: page `h1` at
                the page-title step, section `h2` here, item `h3` below it,
                each step quieter than its parent. */}
            <h2 id={`theme-${theme.slug}`} className="text-section-title">
              {theme.title}
            </h2>
            <span className="label-mono shrink-0">{themePosts.length}</span>
          </div>
          {/* `max-w-prose` (65ch), not `max-w-2xl`: 672px of 14px text runs to
              about 96 characters, and these five section descriptions are
              the widest running text on the index. */}
          <p className="mt-3 max-w-prose text-sm text-muted-foreground">{theme.description}</p>
          <ul className="mt-6 divide-y divide-border border-b border-border">
            {themePosts.map((post) => (
              <li key={post.slug}>
                <Link href={`/blog/${post.slug}`} prefetch={false} className="group block py-4">
                  {/* The wall label DESIGN.md's row pattern asks for, and this
                      index omitted: "a mono label, a semibold title…, a
                      two-line clamped description". Every essay authors a
                      stage, and until now the index showed none of them — a
                      seedling and an evergreen looked identical, which is the
                      one thing writing-style.md says the label is for: "the
                      label is the honesty". The reader saw it only after
                      committing to the click. */}
                  <span className="label-mono flex flex-wrap items-center gap-x-3 gap-y-1">
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                    {post.stage && (
                      <>
                        <span aria-hidden className="text-foreground/25">·</span>
                        <StageBadge stage={post.stage} />
                      </>
                    )}
                  </span>
                  {/* An `h3` on the ramp, not a `<span>` at body size.
                      The heading outline of the site's most important index
                      was H1 plus five H2s and nothing else: 83 essay titles
                      were `<span>`s, so a screen-reader user could not use the
                      heading rotor to skim them at all, and sighted readers got
                      them at 16px Instrument Sans — body copy, in the body
                      voice, for the one element the whole page exists to let
                      you choose between.
                      `text-card-title` is the step DESIGN.md defines for a
                      heading inside a list row, and it is Fraunces, so the
                      title now reads in the display voice against its mono
                      label and sans description. */}
                  <h3 className="text-card-title mt-2 text-foreground group-hover:text-primary">
                    {post.title}
                  </h3>
                  {/* `max-w-prose`. This ran the full 1152px — measured at
                      121 characters per line at 1440px, against a Measure Rule
                      this same session wrote into DESIGN.md and then did not
                      apply to the page with the most running text on it. */}
                  <span className="mt-1 block max-w-prose text-sm text-muted-foreground line-clamp-2">
                    {post.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
