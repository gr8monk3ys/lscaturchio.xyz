import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Sports Are the Last Public Ritual",
  description: "In a secular, atomized society, stadiums are one of the few places where strangers still cry together without irony.",
  date: "2026-04-03",
  image: "/images/blog/default.webp",
  tags: ["culture", "sports", "community", "ritual"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
