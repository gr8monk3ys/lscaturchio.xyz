import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "The Water Wars Are Already Here",
  description: "Water scarcity is not a future crisis. It is a present emergency reshaping geopolitics, agriculture, and daily survival for billions of people right now.",
  date: "2026-02-24",
  image: "https://images.unsplash.com/photo-1504297050568-910d24c426d3?w=1200&q=80",
  tags: ["environment", "politics", "resources", "climate"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
