import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Borders Are Newer Than You Think",
  description: "The modern border regime is barely a century old, and pretending otherwise distorts every immigration debate we have.",
  date: "2026-03-08",
  image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&q=80",
  tags: ["politics", "immigration", "history", "geography"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
