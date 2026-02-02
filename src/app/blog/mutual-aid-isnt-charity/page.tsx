import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Mutual Aid Isn't Charity",
  description: "The difference between giving help and building power. Charity maintains hierarchy while mutual aid dissolves it.",
  date: "2025-09-22",
  image: "/images/blog/default.webp",
  tags: ["mutual-aid", "solidarity", "organizing", "politics"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
