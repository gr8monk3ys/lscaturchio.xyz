import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "The Automation Apocalypse That Wasn't (And What's Actually Happening)",
  description:
    "Oxford predicted 47% of jobs at risk. Since then, 16 million jobs were added. What the data actually shows about AI, automation, and the future of work.",
  date: "2025-01-10",
  image: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=1200&q=80",
  tags: ["ai-automation", "future-of-work", "labor-economics", "policy"],
  series: "AI and Society",
  seriesOrder: 1,
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
