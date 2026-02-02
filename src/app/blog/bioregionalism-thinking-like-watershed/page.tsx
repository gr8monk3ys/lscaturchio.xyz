import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Bioregionalism: Thinking Like a Watershed",
  description: "Political boundaries are arbitrary. Ecological ones aren't. What organizing politics around natural systems actually means.",
  date: "2025-07-14",
  image: "/images/blog/default.webp",
  tags: ["bioregionalism", "ecology", "geography", "politics"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
