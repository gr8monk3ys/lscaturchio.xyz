import { BlogLayout } from "@/components/blog/BlogLayout";
import Content, { meta } from "./content.mdx";

import { buildBlogMetadata } from "@/lib/seo";
export const metadata = buildBlogMetadata(meta, "/blog/audit-only-checks-what-it-reaches");

export default function Page() {
  return (
    <BlogLayout meta={meta} slug="audit-only-checks-what-it-reaches">
      <Content />
    </BlogLayout>
  );
}
