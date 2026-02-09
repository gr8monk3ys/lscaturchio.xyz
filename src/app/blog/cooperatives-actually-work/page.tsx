import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Cooperatives Actually Work",
  description: "Worker-owned businesses survive longer, pay better, and don't require exploitation. The barriers are political, not economic.",
  date: "2025-09-29",
  image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&q=80",
  tags: ["economics", "cooperatives", "labor", "alternatives"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
