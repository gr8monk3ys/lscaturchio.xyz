import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Cooperatives Actually Work",
  description: "Worker-owned businesses survive longer, pay better, and don't require exploitation. The barriers are political, not economic.",
  date: "2025-09-29",
  image: "/images/blog/default.webp",
  tags: ["economics", "cooperatives", "labor", "alternatives"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
