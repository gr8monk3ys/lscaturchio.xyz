import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Wu Wei and the Backwards Law",
  description: "The harder you chase something, the more it evades you. Alan Watts' backwards law and the paradox of effortless action.",
  date: "2026-02-02",
  image: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=1200&q=80",
  tags: ["philosophy", "taoism", "productivity", "wu-wei"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
