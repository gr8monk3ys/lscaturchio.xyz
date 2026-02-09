import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Boredom Is a Skill",
  description: "We engineered boredom out of existence and lost something we cannot get back from a screen.",
  date: "2026-02-11",
  image: "/images/blog/default.webp",
  tags: ["philosophy", "attention", "psychology", "culture"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
