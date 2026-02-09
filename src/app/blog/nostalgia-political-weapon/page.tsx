import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Nostalgia Is a Political Weapon",
  description: "Every authoritarian movement sells a mythologized past. The longing is real. The history is fabricated.",
  date: "2026-02-22",
  image: "https://images.unsplash.com/photo-1461360228754-6e81c478b882?w=1200&q=80",
  tags: ["politics", "culture", "history", "psychology"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
