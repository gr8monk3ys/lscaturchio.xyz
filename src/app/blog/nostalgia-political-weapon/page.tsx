import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Nostalgia Is a Political Weapon",
  description: "Every authoritarian movement sells a mythologized past. The longing is real. The history is fabricated.",
  date: "2026-02-22",
  image: "/images/blog/default.webp",
  tags: ["politics", "culture", "history", "psychology"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
