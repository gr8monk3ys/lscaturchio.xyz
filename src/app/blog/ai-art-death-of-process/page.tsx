import { BlogLayout } from "@/components/blog/BlogLayout";
import Content, { meta } from "./content.mdx";

import { buildBlogMetadata } from "@/lib/seo";
export const metadata = buildBlogMetadata(meta, "/blog/ai-art-death-of-process");

export default function Page() {
  return (
    <BlogLayout meta={meta} slug="ai-art-death-of-process">
      <Content />
    </BlogLayout>
  );
}
