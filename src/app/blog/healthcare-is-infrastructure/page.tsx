import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Healthcare Is Infrastructure",
  description: "We treat healthcare like a consumer product when it functions like a road or a power grid.",
  date: "2026-03-04",
  image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&q=80",
  tags: ["politics", "healthcare", "economics", "policy"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
