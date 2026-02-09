import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Open Source Has a Sustainability Problem",
  description: "The entire internet runs on software maintained by exhausted volunteers. That's not a feature — it's a crisis.",
  date: "2026-03-16",
  image: "/images/blog/default.webp",
  tags: ["technology", "open-source", "labor", "economics"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
