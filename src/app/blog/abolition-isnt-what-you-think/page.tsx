import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Abolition Isn't What You Think",
  description: "Abolition is not the absence of safety but the presence of something better than cages.",
  date: "2026-03-06",
  image: "/images/blog/default.webp",
  tags: ["politics", "justice", "abolition", "philosophy"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
