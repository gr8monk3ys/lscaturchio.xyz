import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "GDP Is a Terrible Measure of Progress",
  description: "We have been steering the economy by staring at the wrong dashboard for sixty years.",
  date: "2026-03-24",
  image: "/images/blog/default.webp",
  tags: ["economics", "policy", "measurement", "alternatives"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
