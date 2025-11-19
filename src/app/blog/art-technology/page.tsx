import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "The Intersection of Art and Technology",
  description: "Investigating how technology is influencing and transforming the world of art.",
  date: "2025-02-26",
  image: "/images/blog/default.webp",
  tags: ["art", "technology", "creativity"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
