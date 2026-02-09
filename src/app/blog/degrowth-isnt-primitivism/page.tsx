import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Degrowth Isn't Primitivism",
  description: "You can have modern medicine and less stuff. These aren't contradictory. Degrowth targets throughput, not quality of life.",
  date: "2025-09-01",
  image: "https://images.unsplash.com/photo-1473773508845-188df298d2d1?w=1200&q=80",
  tags: ["degrowth", "economics", "environment", "sustainability"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
