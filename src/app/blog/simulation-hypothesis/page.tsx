import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Bostrom's Simulation Argument Is Less Than You Think",
  description:
    "Bostrom's trilemma is logically valid but empirically empty. The real question isn't probabilityit's whether 'simulated' is even a meaningful category.",
  date: "2025-01-10",
  image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&q=80",
  tags: ["philosophy", "simulation-theory", "bostrom", "consciousness"],
  series: "Philosophy of Mind",
  seriesOrder: 2,
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
