# Contributing

This repository is maintained as a small, fast-moving codebase. Keep changes narrow, verify them locally, and update docs whenever workflows or behavior change.

## Before You Change Anything

- Read [README.md](README.md), [docs/repository-guide.md](docs/repository-guide.md), and [docs/operations.md](docs/operations.md)
- Check `.env.example` for required services and feature flags
- Keep one concern per change when possible

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Examples use `npm`, but `bun install` and `bun run ...` also work.

## Validation

Run the smallest useful set for the change, and do not skip docs updates when commands, routes, or workflows change.

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Run these when the change touches UI, routing, or performance-sensitive flows:

```bash
npm run test:e2e
npm run perf:lighthouse
```

## Content And Data Changes

- Blog content lives in `src/app/blog/[slug]/`
- Retrieval source files live in `public/my-data/`
- If audio files change, run `npm run generate-audio-manifest`
- If retrieval content changes and chat quality matters, run `npm run generate-embeddings`
- If media assets change, `npm run audit-media` is the quickest sanity check

## Housekeeping Rules

- Do not commit local artifacts such as `.next`, `coverage`, `playwright-report`, `test-results`, `.lighthouseci`, `.playwright-cli`, or `tmp`
- Do not commit secrets, `.env.local`, or provider credentials
- Remove dead files and stale docs instead of letting them accumulate
- Use clear commit messages that describe intent and scope
