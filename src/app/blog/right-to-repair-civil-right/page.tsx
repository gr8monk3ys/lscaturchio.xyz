import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Right to Repair Is a Civil Right",
  description: "You bought it but you don't own it. Repair restrictions aren't a consumer inconvenience, they're a property rights crisis.",
  date: "2026-03-12",
  image: "/images/blog/default.webp",
  tags: ["technology", "ownership", "policy", "economics"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
