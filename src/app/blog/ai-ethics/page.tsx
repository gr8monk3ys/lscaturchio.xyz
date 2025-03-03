import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "The Ethics of Artificial Intelligence",
  description: "Discussing the ethical considerations surrounding the development and deployment of artificial intelligence.",
  date: "2025-02-23",
  image: "/images/blog/ai-ethics.webp",
  tags: ["ethics", "technology", "artificial intelligence"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
