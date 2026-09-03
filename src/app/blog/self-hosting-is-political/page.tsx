import { BlogLayout } from "@/components/blog/BlogLayout";
import Content, { meta } from "./content.mdx";

import { buildBlogMetadata } from "@/lib/seo";
export const metadata = buildBlogMetadata(meta, "/blog/self-hosting-is-political");

export default function Page() {
  return (
    <BlogLayout meta={meta} slug="self-hosting-is-political">
      <Content />
    </BlogLayout>
  );
}
