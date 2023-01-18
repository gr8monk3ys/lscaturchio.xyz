import { BlogLayout } from "@/components/blog/BlogLayout";
import Content, { meta } from "./content.mdx";

import { buildBlogMetadata } from "@/lib/seo";
export const metadata = buildBlogMetadata(meta, "/blog/code-playground-demo");

export default function Page() {
  return (
    <BlogLayout meta={meta} readingTime={8}>
      <Content />
    </BlogLayout>
  );
}
