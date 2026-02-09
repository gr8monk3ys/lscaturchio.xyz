import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Where Did Everybody Go?",
  description: "Third places are disappearing because we priced out the conditions that made community happen for free.",
  date: "2026-04-05",
  image: "https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=1200&q=80",
  tags: ["society", "urban", "community", "economics"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
