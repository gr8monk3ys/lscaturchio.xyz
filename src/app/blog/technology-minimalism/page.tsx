import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "The Ethics of Upcycling Old Technology",
  description: "Exploring how refurbishing hardware can empower communities, reduce e-waste, and reflect a minimalist computing ethos.",
  date: "2024-12-15",
  image: "/images/blog/default.webp",
  tags: ["technology", "sustainability", "minimalism", "computing"],
  series: "Digital Minimalism",
  seriesOrder: 2,
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
