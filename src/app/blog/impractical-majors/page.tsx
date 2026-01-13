import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "The Empirical Case for 'Impractical' Majors",
  description:
    "Philosophy majors now have lower unemployment than computer science graduates. The data on humanities education contradicts everything you've been told.",
  date: "2025-01-10",
  image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&q=80",
  tags: ["education", "economics", "philosophy", "career"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
