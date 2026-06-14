import { getAllBlogs } from "@/lib/getAllBlogs";
import { buildPageMetadata } from "@/lib/seo";
import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { Paragraph } from "@/components/Paragraph";
import Link from "next/link";

export const metadata = buildPageMetadata({
  title: "Blog Tags - Lorenzo Scaturchio",
  description: "Browse blog posts by topic. Explore articles on AI, data science, web development, and technology philosophy.",
  path: "/tags",
});

interface TagWithCount {
  name: string;
  count: number;
  posts: Array<{ slug: string; title: string }>;
}

export default async function TagsPage() {
  const blogs = await getAllBlogs();

  // Extract all tags with counts
  const tagMap = new Map<string, TagWithCount>();

  blogs.forEach((blog) => {
    blog.tags.forEach((tag) => {
      if (!tagMap.has(tag)) {
        tagMap.set(tag, {
          name: tag,
          count: 0,
          posts: [],
        });
      }
      const tagData = tagMap.get(tag)!;
      tagData.count++;
      tagData.posts.push({ slug: blog.slug, title: blog.title });
    });
  });

  // Convert to array and sort by count (descending)
  const tags = Array.from(tagMap.values()).sort((a, b) => b.count - a.count);

  return (
    <Container className="mt-16 lg:mt-32">
      <div className="max-w-4xl mx-auto">
        {/* Header — gallery masthead */}
        <header className="mb-12">
          <span className="label-mono block">Garden · Tags</span>
          <Heading className="mt-4 text-4xl font-bold md:text-5xl">Blog Tags</Heading>
          <Paragraph className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Browse {blogs.length} blog posts organized by {tags.length} topics. Click any tag to see related articles.
          </Paragraph>
          <hr className="gallery-rule mt-8" />
        </header>

        <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
          {tags.map((tag) => (
            <Link
              key={tag.name}
              href={`/tag/${encodeURIComponent(tag.name)}`}
              className="group border-t border-border py-6 transition-colors"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-xl font-semibold capitalize group-hover:text-primary transition-colors">
                  {tag.name}
                </h3>
                <span className="label-mono shrink-0">{tag.count}</span>
              </div>

              <div className="mt-3 space-y-1">
                {tag.posts.slice(0, 3).map((post) => (
                  <div
                    key={post.slug}
                    className="text-sm text-muted-foreground group-hover:text-foreground transition-colors truncate"
                  >
                    {post.title}
                  </div>
                ))}
                {tag.posts.length > 3 && (
                  <div className="text-sm text-muted-foreground/70 italic">
                    +{tag.posts.length - 3} more
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16">
          <h3 className="label-mono">All Tags</h3>
          <hr className="gallery-rule mt-4" />
          <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2">
            {tags.map((tag) => (
              <Link
                key={tag.name}
                href={`/tag/${encodeURIComponent(tag.name)}`}
                className="text-sm capitalize text-muted-foreground hover:text-primary transition-colors"
              >
                {tag.name}{" "}
                <span className="text-muted-foreground/60">({tag.count})</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}
