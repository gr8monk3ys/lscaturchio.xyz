import { getAllBlogs } from "@/lib/getAllBlogs";
import { Container } from "@/components/Container";
import { Heading } from "@/components/Heading";
import { Paragraph } from "@/components/Paragraph";
import { Tag } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog Tags - Lorenzo Scaturchio",
  description: "Browse blog posts by topic. Explore articles on AI, data science, web development, and technology philosophy.",
};

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
        <div className="flex items-center gap-3 mb-4">
          <Tag className="h-8 w-8 text-primary" />
          <Heading className="text-4xl font-bold">Blog Tags</Heading>
        </div>

        <Paragraph className="text-lg text-muted-foreground mb-12">
          Browse {blogs.length} blog posts organized by {tags.length} topics. Click any tag to see related articles.
        </Paragraph>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tags.map((tag) => (
            <Link
              key={tag.name}
              href={`/tag/${encodeURIComponent(tag.name)}`}
              className="group p-6 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary transition-all hover:shadow-lg bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-semibold capitalize group-hover:text-primary transition-colors">
                  {tag.name}
                </h3>
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  {tag.count}
                </span>
              </div>

              <div className="space-y-2">
                {tag.posts.slice(0, 3).map((post) => (
                  <div
                    key={post.slug}
                    className="text-sm text-muted-foreground group-hover:text-foreground transition-colors truncate"
                  >
                    • {post.title}
                  </div>
                ))}
                {tag.posts.length > 3 && (
                  <div className="text-sm text-muted-foreground italic">
                    +{tag.posts.length - 3} more
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 p-6 rounded-2xl bg-muted/50 border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold mb-2">All Tags</h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag.name}
                href={`/tag/${encodeURIComponent(tag.name)}`}
                className="px-3 py-1 rounded-full bg-background border border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary text-sm capitalize transition-colors"
              >
                {tag.name} ({tag.count})
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}
