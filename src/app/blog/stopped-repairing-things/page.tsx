import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Why We Stopped Repairing Things",
  description: "Your grandparents repaired everything. You throw everything away. This isn't a generational virtue difference.",
  date: "2026-04-07",
  image: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=1200&q=80",
  tags: ["economics", "culture", "environment", "design"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
