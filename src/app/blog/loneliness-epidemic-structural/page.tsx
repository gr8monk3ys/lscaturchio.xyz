import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "The Loneliness Epidemic Is Structural",
  description: "Loneliness isn't a personal failing. It's what happens when you design cities for cars instead of people.",
  date: "2026-04-01",
  image: "/images/blog/default.webp",
  tags: ["society", "psychology", "infrastructure", "community"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
