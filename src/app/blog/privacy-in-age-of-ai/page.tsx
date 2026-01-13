import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Privacy in the Age of AI",
  description: "Exploring the intersection of artificial intelligence and personal privacy, examining practical strategies for maintaining digital sovereignty without sacrificing technological progress.",
  date: "2024-01-23",
  image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&q=80",
  tags: ["data-privacy", "ai-surveillance", "digital-sovereignty", "federated-learning"],
  series: "AI and Society",
  seriesOrder: 2,
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
