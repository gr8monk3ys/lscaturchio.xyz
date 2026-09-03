import { BlogLayout } from "@/components/blog/BlogLayout";
import Content, { meta } from "./content.mdx";

import { buildBlogMetadata } from "@/lib/seo";
export const metadata = buildBlogMetadata(meta, "/blog/deportation-machine-no-off-switch");

export default function Page() {
  return (
    <BlogLayout meta={meta} slug="deportation-machine-no-off-switch">
      <Content />
    </BlogLayout>
  );
}
