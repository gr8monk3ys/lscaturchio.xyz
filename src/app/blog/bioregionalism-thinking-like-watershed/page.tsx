import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Bioregionalism: Thinking Like a Watershed",
  description: "Political boundaries are arbitrary. Ecological ones aren't. What organizing politics around natural systems actually means.",
  date: "2025-07-14",
  image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80",
  tags: ["bioregionalism", "ecology", "geography", "politics"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
