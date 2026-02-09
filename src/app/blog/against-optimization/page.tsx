import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Against Optimization",
  description: "The cult of productivity is a trap. You cannot life-hack your way to meaning. A critique of optimization culture.",
  date: "2026-01-26",
  image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=80",
  tags: ["philosophy", "productivity", "minimalism", "life"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
