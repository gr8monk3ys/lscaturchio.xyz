import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Silicon Valley's Death Problem",
  description: "Transhumanism is terror management theory funded by venture capital, and it is telling on itself.",
  date: "2026-02-16",
  image: "https://images.unsplash.com/photo-1496065187959-7f07c4e546b7?w=1200&q=80",
  tags: ["technology", "philosophy", "mortality", "transhumanism"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
