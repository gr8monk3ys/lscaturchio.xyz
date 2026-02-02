import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Journalism Is Dead, Long Live Journalism",
  description: "The business model collapsed. The practice survives in unexpected places. What journalism means when the newspapers are gone.",
  date: "2025-08-18",
  image: "/images/blog/default.webp",
  tags: ["media", "journalism", "information", "institutions"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
