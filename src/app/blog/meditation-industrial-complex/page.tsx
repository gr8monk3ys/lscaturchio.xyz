import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "The Meditation Industrial Complex",
  description: "How mindfulness got stripped from its Buddhist roots and sold back as a productivity hack for corporate America.",
  date: "2026-02-09",
  image: "/images/blog/default.webp",
  tags: ["philosophy", "meditation", "productivity", "capitalism"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
