import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Local Food Isn't Elitist",
  description: "Local food looks expensive because industrial food is artificially cheap, and somebody is paying the hidden costs.",
  date: "2026-03-30",
  image: "/images/blog/default.webp",
  tags: ["food", "economics", "environment", "community"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
