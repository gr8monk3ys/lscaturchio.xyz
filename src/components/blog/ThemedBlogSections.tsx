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
            <h2 id={`theme-${theme.slug}`} className="text-card-title">
              {theme.title}
            </h2>
            <span className="label-mono shrink-0">{themePosts.length}</span>
          </div>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{theme.description}</p>
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
                  <span className="mt-2 block font-semibold text-foreground group-hover:text-primary">
                    {post.title}
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground line-clamp-2">
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
