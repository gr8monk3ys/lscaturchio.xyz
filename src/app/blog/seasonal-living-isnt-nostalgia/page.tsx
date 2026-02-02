import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Seasonal Living Isn't Nostalgia",
  description: "Your body knows what season it is. Industrial society pretends it doesn't matter. It does.",
  date: "2025-05-19",
  image: "/images/blog/default.webp",
  tags: ["time", "seasons", "nature", "lifestyle"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
