import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Seasonal Living Isn't Nostalgia",
  description: "Your body knows what season it is. Industrial society pretends it doesn't matter. It does.",
  date: "2025-05-19",
  image: "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=1200&q=80",
  tags: ["time", "seasons", "nature", "lifestyle"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
