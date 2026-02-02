import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "The Taoist Case Against Hustle Culture",
  description: "Ancient philosophy says stop forcing it. Modern burnout rates prove it right. Why wu wei beats grinding every time.",
  date: "2026-01-05",
  image: "/images/blog/default.webp",
  tags: ["philosophy", "taoism", "hustle-culture", "burnout"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
