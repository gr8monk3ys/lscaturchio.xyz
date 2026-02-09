import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "The Myth of the Neutral Tool",
  description: "Technology embeds politics. The design is the ideology. There are no mere instruments - every tool shapes what's possible and what's thinkable.",
  date: "2025-10-13",
  image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80",
  tags: ["technology", "philosophy", "politics", "design"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
