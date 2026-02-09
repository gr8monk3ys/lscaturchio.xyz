import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Nihilism Is Lazy Philosophy",
  description: "Nothing matters is the intellectual equivalent of not voting and it deserves the same respect.",
  date: "2026-02-18",
  image: "/images/blog/default.webp",
  tags: ["philosophy", "nihilism", "meaning", "existentialism"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
