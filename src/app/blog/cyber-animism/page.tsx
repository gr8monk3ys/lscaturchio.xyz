import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Software is Magic: Understanding Consciousness Through Computational Patterns",
  description: "Why animism might not be superstition, how consciousness works as a learning algorithm, and what it means that your mind is software running on biological hardware.",
  date: "2024-10-24",
  image: "/images/blog/default.webp",
  tags: ["philosophy", "consciousness", "ai", "systems-thinking"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
