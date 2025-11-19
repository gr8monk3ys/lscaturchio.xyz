import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Exploring the Metaverse: Opportunities and Challenges",
  description: "Examining the potential of the metaverse, its challenges, and its impact on society.",
  date: "2025-02-25",
  image: "/images/blog/default.webp",
  tags: ["technology", "metaverse", "virtual reality", "augmented reality"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
