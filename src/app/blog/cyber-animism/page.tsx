import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Software is Magic: Understanding Consciousness Through Computational Patterns",
  description: "Why animism might not be superstition, how consciousness works as a learning algorithm, and what it means that your mind is software running on biological hardware.",
  date: "2024-10-24",
  image: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=1200&q=80",
  tags: ["consciousness-studies", "computational-theory-of-mind", "emergence", "ai-consciousness"],
  series: "Philosophy of Mind",
  seriesOrder: 1,
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
