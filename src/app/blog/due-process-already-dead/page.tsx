import { BlogLayout } from "@/components/blog/BlogLayout";
import Content, { meta } from "./content.mdx";

import { buildBlogMetadata } from "@/lib/seo";
export const metadata = buildBlogMetadata(meta, "/blog/due-process-already-dead");

export default function Page() {
  return (
    <BlogLayout meta={meta} slug="due-process-already-dead">
      <Content />
    </BlogLayout>
  );
}
