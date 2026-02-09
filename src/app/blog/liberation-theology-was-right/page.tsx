import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Liberation Theology Was Right",
  description: "The radical tradition within Christianity that sided with the poor. What happens when religion takes material conditions seriously.",
  date: "2025-06-30",
  image: "https://images.unsplash.com/photo-1548407260-da850faa41e8?w=1200&q=80",
  tags: ["religion", "theology", "politics", "liberation"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
