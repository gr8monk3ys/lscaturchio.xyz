import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Building RAG Systems: A Practical Guide",
  description: "A comprehensive guide to building Retrieval-Augmented Generation systems from scratch, covering vector databases, embeddings, and practical implementation strategies.",
  date: "2024-01-23",
  image: "/images/blog/default.webp",
  tags: ["ai", "machine-learning", "rag", "python"],
  series: "AI and Society",
  seriesOrder: 3,
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
