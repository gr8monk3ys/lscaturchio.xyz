import Link from "next/link";
import { Container } from "@/components/Container";
import { buildPageMetadata } from "@/lib/seo";
import { getAllBlogs } from "@/lib/getAllBlogs";
import type { BlogPost } from "@/lib/getAllBlogs";

export const metadata = buildPageMetadata({
  title: "Map",
  description:
    "A map of the whole garden — every essay, grouped by the theme it grows in.",
  path: "/map",
});

export const revalidate = 3600;

function roomLabel(tag: string): string {
  return tag.replace(/-/g, " ");
}

export default async function MapPage() {
  const blogs = await getAllBlogs();

  // Each essay is placed once, under its primary (first) tag — the bed it
  // grows in. Rooms with a single essay collect into "Field notes" so the map
  // shows structure, not a hundred singletons.
  const byTag = new Map<string, BlogPost[]>();
  for (const post of blogs) {
    const tag = post.tags[0] ?? "untagged";
    const bucket = byTag.get(tag);
    if (bucket) bucket.push(post);
    else byTag.set(tag, [post]);
  }

  const rooms = Array.from(byTag.entries())
    .map(([tag, posts]) => ({
      tag,
      posts: posts.slice().sort((a, b) => (a.date < b.date ? 1 : -1)),
    }))
    .sort((a, b) => b.posts.length - a.posts.length || a.tag.localeCompare(b.tag));

  const major = rooms.filter((r) => r.posts.length >= 2);
  const fieldNotes = rooms
    .filter((r) => r.posts.length === 1)
    .flatMap((r) => r.posts)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const themeCount = major.length + (fieldNotes.length ? 1 : 0);

  return (
    <Container className="mt-16 lg:mt-32">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12">
          <span className="label-mono block">The Garden</span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            A map of everything here
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            {blogs.length} essays across {themeCount} beds. It wanders on purpose —
            retrieval systems next to carceral policy next to Taoism. Pick a thread.
          </p>
          <hr className="gallery-rule mt-8" />
        </header>

        {/* Floor plan — rooms flow in masonry columns, each kept whole. */}
        <div className="columns-1 gap-10 md:columns-2 lg:columns-3">
          {major.map((room) => (
            <section key={room.tag} className="mb-10 break-inside-avoid">
              <div className="flex items-baseline justify-between gap-2 border-b border-border pb-2">
                <h2 className="label-mono text-foreground">{roomLabel(room.tag)}</h2>
                <span className="label-mono">{room.posts.length}</span>
              </div>
              <ul className="mt-3 space-y-2.5">
                {room.posts.map((post) => (
                  <li key={post.slug}>
                    <Link
                      href={`/blog/${post.slug}`}
                      prefetch={false}
                      className="group block leading-snug"
                    >
                      <span className="font-medium tracking-tight transition-colors group-hover:text-primary">
                        {post.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {fieldNotes.length > 0 && (
            <section className="mb-10 break-inside-avoid">
              <div className="flex items-baseline justify-between gap-2 border-b border-border pb-2">
                <h2 className="label-mono text-foreground">Field notes</h2>
                <span className="label-mono">{fieldNotes.length}</span>
              </div>
              <ul className="mt-3 space-y-2.5">
                {fieldNotes.map((post) => (
                  <li key={post.slug}>
                    <Link
                      href={`/blog/${post.slug}`}
                      prefetch={false}
                      className="group block leading-snug"
                    >
                      <span className="font-medium tracking-tight transition-colors group-hover:text-primary">
                        {post.title}
                      </span>
                      <span className="label-mono ml-2 align-middle">{post.tags[0]}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </Container>
  );
}
