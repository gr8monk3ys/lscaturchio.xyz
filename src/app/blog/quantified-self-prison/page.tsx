import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "The Quantified Self Is a Prison",
  description: "We turned our bodies into dashboards and our lives into optimization problems. The numbers aren't setting us free.",
  date: "2026-03-18",
  image: "/images/blog/default.webp",
  tags: ["technology", "psychology", "health", "surveillance"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
