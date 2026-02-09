import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "AI Art and the Death of Process",
  description: "The debate about AI art focuses on output quality. That misses the point entirely.",
  date: "2026-03-14",
  image: "/images/blog/default.webp",
  tags: ["technology", "art", "AI", "creativity"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
