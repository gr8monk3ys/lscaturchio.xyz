# CLAUDE.md

This file is a short operator guide for Claude-style agents working in this repository. Keep it aligned with the main docs instead of duplicating large stale sections.

## Start Here

- [README.md](README.md)
- [docs/repository-guide.md](docs/repository-guide.md)
- [docs/operations.md](docs/operations.md)
- [docs/writing-style.md](docs/writing-style.md) — required before writing or editing any blog post

## Project Summary

`lscaturchio.xyz` is a Next.js 16 App Router site with:

- marketing and portfolio pages
- an MDX blog
- AI chat with retrieval over `public/my-data`
- Neon-backed engagement and content APIs
- pre-generated audio support for blog posts

## Commands

Examples use `npm`, but Bun is also supported and used in CI.

```bash
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
npm run perf:lighthouse
```

## Architecture Notes

- `src/app`: routes, layouts, metadata, route handlers, sitemap
- `src/components`: page sections and reusable UI
- `src/lib`: shared helpers for chat, DB, validation, SEO, and content metadata
- `public/my-data`: retrieval source files used by embeddings and some content integrations
- `src/generated/audio-manifest.ts`: generated source file built from `public/audio`
- `scripts`: maintenance scripts for embeddings, audio, media, smoke tests, and webmentions

## Important Conventions

- Use Server Components by default
- Keep blog metadata helpers centralized in `src/lib/blog-data.ts` and `src/lib/getAllBlogs.ts`
- The sitemap is defined by `src/app/sitemap.ts`; do not reintroduce legacy postbuild sitemap scripts
- When audio files change, regenerate the audio manifest
- When retrieval content changes, rerun embeddings if chat relevance matters
- Do not commit local artifacts such as `.next`, `coverage`, `playwright-report`, `test-results`, `.lighthouseci`, or `.playwright-cli`

## Documentation Rule

If a change affects setup, validation, deployment, or recurring maintenance, update the docs in the same pass.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
