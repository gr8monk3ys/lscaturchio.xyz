import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Privacy in the Age of AI",
  description: "Exploring the intersection of artificial intelligence and personal privacy, examining practical strategies for maintaining digital sovereignty without sacrificing technological progress.",
  date: "2024-01-23",
  image: "/images/blog/default.webp",
  tags: ["privacy", "ai", "technology", "digital-sovereignty"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
