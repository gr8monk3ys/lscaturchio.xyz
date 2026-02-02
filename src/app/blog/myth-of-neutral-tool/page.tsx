import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "The Myth of the Neutral Tool",
  description: "Technology embeds politics. The design is the ideology. There are no mere instruments - every tool shapes what's possible and what's thinkable.",
  date: "2025-10-13",
  image: "/images/blog/default.webp",
  tags: ["technology", "philosophy", "politics", "design"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
