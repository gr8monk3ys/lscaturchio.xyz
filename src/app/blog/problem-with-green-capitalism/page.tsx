import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "The Problem With Green Capitalism",
  description: "You cannot consume your way to sustainability. The market will not save us. Green capitalism is an oxymoron that delays real solutions.",
  date: "2025-08-25",
  image: "/images/blog/default.webp",
  tags: ["climate", "capitalism", "environment", "economics"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
