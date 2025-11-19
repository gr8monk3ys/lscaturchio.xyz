import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "The Simulation Hypothesis",
  description: "Exploring the philosophical and scientific arguments for and against the idea that our reality is a computer simulation.",
  date: "2025-02-22",
  image: "/images/blog/default.webp",
  tags: ["philosophy", "technology", "science"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
