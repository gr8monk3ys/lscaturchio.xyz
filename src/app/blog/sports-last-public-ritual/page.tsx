import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Sports Are the Last Public Ritual",
  description: "In a secular, atomized society, stadiums are one of the few places where strangers still cry together without irony.",
  date: "2026-04-03",
  image: "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=1200&q=80",
  tags: ["culture", "sports", "community", "ritual"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
