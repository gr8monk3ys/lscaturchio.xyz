import Link from "next/link";

import type { BlogPreview } from "@/lib/blog-data";
import { formatDate } from "@/lib/formatDate";
import { StageBadge } from "@/components/blog/stage-badge";

/**
 * The one row an essay gets, wherever `/blog` lists one.
 *
 * `DESIGN.md` states the pattern twice — "Lists are stacked rows separated by
 * hairlines with the label above the title and the description below, not
 * tiled cards" (:237) and "most 'cards' on the site are not cards. Index pages
 * use stacked rows divided by hairlines: a mono label, a semibold title that
 * turns Forest Ink on hover, a two-line clamped description in Ink Muted"
 * (:308) — and `/blog` obeyed it right up until you touched a filter, at which
 * point `BlogGrid` replaced the whole page with a three-column grid of
 * full-bleed stock photography.
 *
 * Nobody chose that. It is two components that were never reconciled when the
 * index was rebuilt, and the cost landed on the reader: narrowing a list is
 * supposed to remove items from it, not hand you a page that looks like it
 * belongs to a different site. Extracting the row is what makes the filtered
 * view able to say "here is the same list, shorter".
 *
 * Ordering is the caller's business. The themed index groups by theme; the
 * filtered archive is a flat date-ordered run.
 */
export function EssayRows({ posts }: { posts: BlogPreview[] }) {
  if (posts.length === 0) return null;

  /* `max-w-3xl` on the list, not on the page.
     A review measured the hairline dividers at 1152px under 606px of text —
     546px of rule past the content it divides, on the most-seen composition on
     the site. It is an unreconciled collision between two DESIGN.md rules:
     Layout assigns index pages the wide 72rem column (:233), and the Measure
     Rule caps running text at 65ch (:264). Both were applied literally and
     nobody asked what the container was for once the text could not fill it.

     The obvious-looking fix — move the date and stage to the right edge so the
     width is used — breaks the other half of :237, which puts the label above
     the title and the description below. So the list caps instead.

     `max-w-2xl`, not `3xl`: the first attempt reached for 48rem and the
     `width-scale` drift rule rejected it, correctly. `page-width.ts` defines
     the scale as 2xl / 4xl / 6xl / none, and 3xl was removed from it
     deliberately — the rule holds at zero matches by design and exists to stop
     a fourth named tier coming back. 42rem is both a sanctioned tier and the
     tighter fit: it is the documented *reading* width, which is the right
     measure for a list whose whole purpose is choosing what to read. The page
     header and the galleries keep the wide column; DESIGN.md records the
     distinction rather than leaving the two rules to collide again. */
  return (
    <ul className="max-w-2xl divide-y divide-border border-b border-border">
      {posts.map((post) => (
        <li key={post.slug}>
          <Link href={`/blog/${post.slug}`} prefetch={false} className="group block py-4">
            {/* The wall label the row pattern asks for. Every essay authors a
                stage, and the index used to show none of them — a seedling and
                an evergreen looked identical, which is the one thing
                writing-style.md says the label is for: "the label is the
                honesty". The reader saw it only after committing to the
                click. */}
            <span className="label-mono flex flex-wrap items-center gap-x-3 gap-y-1">
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              {post.stage && (
                <>
                  <span aria-hidden className="text-foreground/25">·</span>
                  <StageBadge stage={post.stage} />
                </>
              )}
            </span>

            {/* An `h3` on the ramp, not a `<span>` at body size. The heading
                outline of this index was H1 plus five H2s and nothing else:
                the titles were `<span>`s, so the heading rotor could not reach
                a single essay, and sighted readers got them at 16px Instrument
                Sans — body copy, in the body voice, for the one element the
                page exists to let you choose between. */}
            <h3 className="text-card-title mt-2 text-foreground group-hover:text-primary">
              {post.title}
            </h3>

            {/* `max-w-prose`, per the Measure Rule: this ran the full 1152px,
                measured at 121 characters per line at 1440px. */}
            <span className="mt-1 block max-w-prose text-sm text-muted-foreground line-clamp-2">
              {post.description}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
