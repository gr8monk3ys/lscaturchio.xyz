import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "The Ethics of Upcycling Old Technology",
  description: "Exploring how refurbishing hardware can empower communities, reduce e-waste, and reflect a minimalist computing ethos.",
  date: "2024-12-15",
  image: "/images/blog/default.webp",
  tags: ["technology", "sustainability", "minimalism", "computing"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
