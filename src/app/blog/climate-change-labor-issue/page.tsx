import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Climate Change Is a Labor Issue",
  description: "The workers who extract, transport, and burn fossil fuels are the same ones who'll build what comes next. Climate transition requires labor organizing.",
  date: "2025-09-08",
  image: "/images/blog/default.webp",
  tags: ["climate", "labor", "politics", "environment"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
