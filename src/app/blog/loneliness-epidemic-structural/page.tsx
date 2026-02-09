import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "The Loneliness Epidemic Is Structural",
  description: "Loneliness isn't a personal failing. It's what happens when you design cities for cars instead of people.",
  date: "2026-04-01",
  image: "https://images.unsplash.com/photo-1499578124509-1f4e9d6ec37b?w=1200&q=80",
  tags: ["society", "psychology", "infrastructure", "community"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
