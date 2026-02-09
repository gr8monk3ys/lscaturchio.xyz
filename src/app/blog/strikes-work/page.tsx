import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Strikes Work",
  description: "Historical and contemporary evidence that withholding labor is the most effective leverage workers have. Strikes aren't outdated; they're suppressed because they work.",
  date: "2025-06-16",
  image: "https://images.unsplash.com/photo-1591848478625-de43268e6fb8?w=1200&q=80",
  tags: ["labor", "strikes", "organizing", "economics"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
