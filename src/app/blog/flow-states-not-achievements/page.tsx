import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Flow States Are Not Achievements",
  description: "You can't grind your way into flow. That's the whole point. Why trying to manufacture flow defeats the purpose.",
  date: "2025-12-29",
  image: "/images/blog/default.webp",
  tags: ["philosophy", "flow", "psychology", "productivity"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
