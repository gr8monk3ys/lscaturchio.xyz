import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "The Feed Is the Problem",
  description: "Infinite scroll isn't a feature. It's an extraction mechanism. The feed format itself, not just the content, is designed against human flourishing.",
  date: "2025-08-04",
  image: "/images/blog/default.webp",
  tags: ["social-media", "attention", "design", "technology"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
