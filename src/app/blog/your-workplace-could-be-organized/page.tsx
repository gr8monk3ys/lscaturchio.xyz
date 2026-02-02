import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Your Workplace Could Be Organized",
  description: "What union drives actually look like. It's less dramatic and more possible than you think. The practical reality of workplace organizing.",
  date: "2025-06-09",
  image: "/images/blog/default.webp",
  tags: ["labor", "unions", "organizing", "work"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
