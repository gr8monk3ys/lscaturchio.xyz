import { BlogLayout } from "@/components/blog/BlogLayout";
import Content, { meta } from "./content.mdx";

export default function Page() {
  return (
    <BlogLayout meta={meta} readingTime={8}>
      <Content />
    </BlogLayout>
  );
}
