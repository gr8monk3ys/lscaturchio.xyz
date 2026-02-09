import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Nobody Is Self-Made",
  description: "The self-made billionaire is a myth that serves a political function, and it is time to retire it.",
  date: "2026-03-28",
  image: "/images/blog/default.webp",
  tags: ["economics", "class", "politics", "culture"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
