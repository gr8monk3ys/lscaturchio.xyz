import { groupByTheme } from "@/lib/blog-themes";
import type { BlogPreview } from "@/lib/blog-data";
import { EssayRows } from "@/components/blog/essay-rows";

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
          <div className="mt-6">
            <EssayRows posts={themePosts} />
          </div>
        </section>
      ))}
    </div>
  );
}
