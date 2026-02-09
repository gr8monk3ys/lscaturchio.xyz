import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "AI Art and the Death of Process",
  description: "The debate about AI art focuses on output quality. That misses the point entirely.",
  date: "2026-03-14",
  image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1200&q=80",
  tags: ["technology", "art", "AI", "creativity"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
