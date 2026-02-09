import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Meritocracy Is a Fairy Tale",
  description: "The word meritocracy was coined as satire, and we built an entire economic theology around the joke.",
  date: "2026-03-02",
  image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&q=80",
  tags: ["politics", "economics", "education", "class"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
