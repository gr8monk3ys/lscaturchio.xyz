import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Nihilism Is Lazy Philosophy",
  description: "Nothing matters is the intellectual equivalent of not voting and it deserves the same respect.",
  date: "2026-02-18",
  image: "https://images.unsplash.com/photo-1494059980473-813e73ee784b?w=1200&q=80",
  tags: ["philosophy", "nihilism", "meaning", "existentialism"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
