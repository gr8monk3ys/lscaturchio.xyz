import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Effort Without Striving",
  description: "The distinction between working hard and trying hard. One builds, the other burns you out.",
  date: "2026-01-19",
  image: "https://images.unsplash.com/photo-1510797215324-95aa89f43c33?w=1200&q=80",
  tags: ["philosophy", "work", "taoism", "burnout"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
