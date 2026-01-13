import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "The Definitive Guide to Building RAG Systems in 2025",
  description:
    "Simple RAG fails in productionsuccess requires hybrid retrieval, reranking, contextual chunking, and continuous evaluation. A comprehensive guide based on peer-reviewed research and production benchmarks.",
  date: "2025-01-10",
  image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80",
  tags: ["rag", "vector-databases", "embeddings", "llm-engineering", "AI"],
  series: "AI Engineering",
  seriesOrder: 1,
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
