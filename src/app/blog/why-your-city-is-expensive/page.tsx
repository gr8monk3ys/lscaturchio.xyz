import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Why Your City Is Expensive",
  description: "Housing costs aren't natural market outcomes. They're policy choices defended by people who benefit from artificial scarcity.",
  date: "2025-07-28",
  image: "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=1200&q=80",
  tags: ["housing", "urban", "economics", "policy"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
