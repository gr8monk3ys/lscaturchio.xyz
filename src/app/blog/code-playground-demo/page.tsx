import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Code Walkthrough: React, CSS Animations, and State Management",
  description:
    "Explore practical code examples covering React components, CSS animations, and JavaScript state management patterns. Learn through clear, annotated examples you can copy and try yourself.",
  date: "2025-01-24",
  image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80",
  tags: ["tutorial", "react", "css", "javascript"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta} readingTime={8}>
      <Content />
    </BlogLayout>
  );
}
