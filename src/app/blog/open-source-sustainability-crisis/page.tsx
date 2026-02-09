import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Open Source Has a Sustainability Problem",
  description: "The entire internet runs on software maintained by exhausted volunteers. That's not a feature, it's a crisis.",
  date: "2026-03-16",
  image: "https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=1200&q=80",
  tags: ["technology", "open-source", "labor", "economics"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
