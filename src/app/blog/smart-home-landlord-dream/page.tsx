import { BlogLayout } from "@/components/blog/BlogLayout";
import Content, { meta } from "./content.mdx";

import { buildBlogMetadata } from "@/lib/seo";
export const metadata = buildBlogMetadata(meta, "/blog/smart-home-landlord-dream");

export default function Page() {
  return (
    <BlogLayout meta={meta} slug="smart-home-landlord-dream">
      <Content />
    </BlogLayout>
  );
}
