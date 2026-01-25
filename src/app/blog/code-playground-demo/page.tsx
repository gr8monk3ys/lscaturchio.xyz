import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Interactive Code Playgrounds: Learn by Doing",
  description:
    "Explore interactive code examples that you can edit and run directly in your browser. Learn React, CSS animations, and JavaScript through hands-on experimentation.",
  date: "2025-01-24",
  image: "/images/blog/default.webp",
  tags: ["tutorial", "react", "css", "javascript", "interactive"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta} readingTime={8}>
      <Content />
    </BlogLayout>
  );
}
