import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "The Feed Is the Problem",
  description: "Infinite scroll isn't a feature. It's an extraction mechanism. The feed format itself, not just the content, is designed against human flourishing.",
  date: "2025-08-04",
  image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=1200&q=80",
  tags: ["social-media", "attention", "design", "technology"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
