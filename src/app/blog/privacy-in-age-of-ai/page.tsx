import { BlogLayout } from "@/components/blog/BlogLayout";
import Content, { meta } from "./content.mdx";

import { buildBlogMetadata } from "@/lib/seo";
export const metadata = buildBlogMetadata(meta, "/blog/privacy-in-age-of-ai");

export default function Page() {
  return (
    <BlogLayout meta={meta} slug="privacy-in-age-of-ai">
      <Content />
    </BlogLayout>
  );
}
