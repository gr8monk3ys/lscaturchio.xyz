import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Where Did Everybody Go?",
  description: "Third places are disappearing because we priced out the conditions that made community happen for free.",
  date: "2026-04-05",
  image: "/images/blog/default.webp",
  tags: ["society", "urban", "community", "economics"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
