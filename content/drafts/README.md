# Drafts

Files here are not wired into the site (nothing under `src/app/blog` globs this
directory, so they don't build, render, or hit the sitemap). They're staged
posts using the same `export const meta = {...}` + MDX schema as
`src/app/blog/<slug>/content.mdx`.

To publish a draft:

1. `mkdir src/app/blog/<slug>` and move the file to `src/app/blog/<slug>/content.mdx`.
2. Generate a cover with `bun run generate-matisse-covers` (or add
   `public/images/blog/<slug>.webp` manually) and set `image` in `meta`, or
   leave it unset to fall back to `default.webp`.
3. Bump `stage` from `seedling` once it's had an editing pass.
4. `bun run lint && bun run typecheck && bun run test` before merging.
