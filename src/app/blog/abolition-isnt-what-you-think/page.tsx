import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Abolition Isn't What You Think",
  description: "Abolition is not the absence of safety but the presence of something better than cages.",
  date: "2026-03-06",
  image: "https://images.unsplash.com/photo-1589578527966-fdac0f44566c?w=1200&q=80",
  tags: ["politics", "justice", "abolition", "philosophy"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
