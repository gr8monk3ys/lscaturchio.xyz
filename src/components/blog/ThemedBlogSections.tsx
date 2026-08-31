import Link from "next/link";
import { groupByTheme } from "@/lib/blog-themes";
import type { BlogPreview } from "@/lib/blog-data";

// BlogPreview already carries slug/title/description/tags; declaring a local
// structural type here would silently drift from it.
export function ThemedBlogSections({ posts }: { posts: BlogPreview[] }) {
  const groups = groupByTheme(posts);

  return (
    <div className="space-y-14">
      {groups.map(({ theme, posts: themePosts }) => (
        <section key={theme.slug} aria-labelledby={`theme-${theme.slug}`}>
          <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
            <h2 id={`theme-${theme.slug}`} className="text-xl font-semibold tracking-tight">
              {theme.title}
            </h2>
            <span className="label-mono shrink-0">{themePosts.length}</span>
          </div>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{theme.description}</p>
          <ul className="mt-6 space-y-4">
            {themePosts.map((post) => (
              <li key={post.slug}>
                <Link href={`/blog/${post.slug}`} prefetch={false} className="group block">
                  <span className="font-semibold text-foreground group-hover:text-primary">
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
