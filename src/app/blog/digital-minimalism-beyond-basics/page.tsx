import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Digital Minimalism Beyond the Hype",
  description:
    "The empirical case for intentional technology usewhat peer-reviewed studies support, what's oversimplified, and what remains genuinely uncertain.",
  date: "2025-01-10",
  image: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=1200&q=80",
  tags: ["digital-minimalism", "attention", "research", "productivity"],
  series: "Digital Minimalism",
  seriesOrder: 1,
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
