import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "The Rational Actor Is Dead",
  description: "Homo economicus never existed but we still build policy like it does, and people keep getting hurt.",
  date: "2026-02-14",
  image: "/images/blog/default.webp",
  tags: ["economics", "psychology", "philosophy", "institutions"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
