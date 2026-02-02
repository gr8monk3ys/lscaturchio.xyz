import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Against Optimization",
  description: "The cult of productivity is a trap. You cannot life-hack your way to meaning. A critique of optimization culture.",
  date: "2026-01-26",
  image: "/images/blog/default.webp",
  tags: ["philosophy", "productivity", "minimalism", "life"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
