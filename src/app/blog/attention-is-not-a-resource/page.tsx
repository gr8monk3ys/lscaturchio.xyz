import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Attention Is Not a Resource",
  description: "The 'attention economy' metaphor gets it wrong, and the error isn't academic.",
  date: "2026-03-20",
  image: "https://images.unsplash.com/photo-1474631245212-32dc3c8310c6?w=1200&q=80",
  tags: ["philosophy", "attention", "economics", "technology"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
