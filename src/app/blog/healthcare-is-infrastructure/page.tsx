import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Healthcare Is Infrastructure",
  description: "We treat healthcare like a consumer product when it functions like a road or a power grid.",
  date: "2026-03-04",
  image: "/images/blog/default.webp",
  tags: ["politics", "healthcare", "economics", "policy"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
