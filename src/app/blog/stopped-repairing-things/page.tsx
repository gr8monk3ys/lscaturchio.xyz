import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Why We Stopped Repairing Things",
  description: "Your grandparents repaired everything. You throw everything away. This isn't a generational virtue difference.",
  date: "2026-04-07",
  image: "/images/blog/default.webp",
  tags: ["economics", "culture", "environment", "design"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
