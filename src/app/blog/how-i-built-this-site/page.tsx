import { BlogLayout } from "@/components/blog/BlogLayout";
import Content, { meta } from "./content.mdx";

export const metadata = {
  title: meta.title,
  description: meta.description,
};

export default function Page() {
  return (
    <BlogLayout meta={meta} readingTime={15}>
      <Content />
    </BlogLayout>
  );
}
