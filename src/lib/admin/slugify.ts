// Dependency-free so both server code and client components can share the
// one slug rule (blog-content.ts is server-weight via @mdx-js/mdx).
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/['".]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
