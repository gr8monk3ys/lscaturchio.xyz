import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Effort Without Striving",
  description: "The distinction between working hard and trying hard. One builds, the other burns you out.",
  date: "2026-01-19",
  image: "/images/blog/default.webp",
  tags: ["philosophy", "work", "taoism", "burnout"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
