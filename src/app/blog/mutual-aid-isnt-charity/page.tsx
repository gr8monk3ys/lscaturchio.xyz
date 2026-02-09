import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Mutual Aid Isn't Charity",
  description: "The difference between giving help and building power. Charity maintains hierarchy while mutual aid dissolves it.",
  date: "2025-09-22",
  image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&q=80",
  tags: ["mutual-aid", "solidarity", "organizing", "politics"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
