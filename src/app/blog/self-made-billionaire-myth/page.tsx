import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Nobody Is Self-Made",
  description: "The self-made billionaire is a myth that serves a political function, and it is time to retire it.",
  date: "2026-03-28",
  image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1200&q=80",
  tags: ["economics", "class", "politics", "culture"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
