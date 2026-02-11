# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**lscaturchio.xyz** is a personal portfolio and blog website built with Next.js 16 App Router. Features include MDX-based blog with series support, AI chat with RAG (OpenAI GPT-4o + Neon pgvector), engagement tracking (views, likes, bookmarks), text-to-speech audio via local XTTS v2 voice cloning, Google AdSense integration, and comprehensive SEO.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, Neon PostgreSQL, OpenAI API, Framer Motion

## Development Commands

```bash
# Development
bun dev                        # Start dev server at localhost:3000
bun run lint                   # Run ESLint
bun run build                  # Production build (auto-generates sitemap via postbuild hook)

# Testing - CRITICAL: use 'bun run test' NOT 'bun test' (Bun's native runner is incompatible with Vitest)
bun run test                           # Run all unit tests (Vitest)
bun run test src/__tests__/lib/utils.test.ts  # Run single test file
bun run test:e2e                       # Run E2E tests (Playwright, auto-starts dev server)
bun run test:e2e -- e2e/blog.spec.ts   # Run specific E2E test

# Content generation
bun run generate-embeddings    # Generate OpenAI embeddings for AI chat RAG
bun run generate-tts           # Generate MP3 audio files for blog TTS (local XTTS v2)
```

## Environment Variables

**Required:** `DATABASE_URL` (Neon PostgreSQL connection string)

**Optional:** `OPENAI_API_KEY`, `GITHUB_TOKEN`, `RESEND_API_KEY`, `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN`, `VOTER_HASH_SALT`, `NEXT_PUBLIC_ADSENSE_CLIENT_ID`, `NEXT_PUBLIC_SITE_URL`

All env vars validated at build time via `src/lib/env.ts` (@t3-oss/env-nextjs + Zod). Skip with `SKIP_ENV_VALIDATION=true`. See `.env.example` for full list.

## Architecture

### Database (Neon PostgreSQL)

Client: `src/lib/db.ts` exports `getDb()` (lazy-initialized Neon SQL client) and `isDatabaseConfigured()`.

```typescript
// Query pattern - tagged template literals (NOT string interpolation)
const sql = getDb()
const rows = await sql`SELECT * FROM views WHERE slug = ${slug}`
// Returns plain array of row objects (no .data/.error wrapper)

// For raw SQL strings (e.g., migrations)
await sql.query(rawSqlString)  // NOT sql(rawSqlString) - that throws
```

**Tables:** `views`, `reactions`, `embeddings` (vector 1536), `newsletter_subscribers`, `vote_records`

**Migration:** `bun run scripts/run-neon-migration.ts` (reads `supabase/migrations/neon_combined_migration.sql`)

**Engagement API routes** use atomic PostgreSQL RPC functions (`increment_view_count()`, `record_vote()`, `remove_vote()`) to prevent race conditions.

### Blog Content (MDX)

Each blog post has two files in `src/app/blog/[slug]/`:

1. `content.mdx` - Blog content with `export const meta = { title, description, date, image, tags, series?, seriesOrder? }`
2. `page.tsx` - Wrapper that imports BlogLayout and Content

**The meta object must be duplicated in both files** - TypeScript cannot import exports from MDX files. Always keep them in sync.

`getAllBlogs()` in `src/lib/getAllBlogs.ts` scans all blog directories at build time, extracting metadata for listings and static generation.

**Series system:** Posts with matching `series` field get automatic prev/next navigation. The `/series` page lists all series.

### Text-to-Speech Pipeline

Blog posts can have pre-generated MP3 audio files at `public/audio/[slug].mp3`. The `TextToSpeech` component (`src/components/blog/text-to-speech.tsx`) checks for the MP3, shows a full audio player if found, or falls back to browser Web Speech API.

**TTS generation** uses local XTTS v2 voice cloning (not a cloud API):
- Script: `scripts/generate-tts.ts` - strips MDX to plain text, chunks it, sends to Python subprocess
- Python backend: `scripts/tts_synthesize.py` - runs XTTS v2 model on CPU
- Voice references: `voice/reference_*.wav` files used for voice cloning
- Setup: `bash scripts/setup-tts-venv.sh` (creates Python venv), then `bash scripts/prepare-voice-reference.sh`
- Prerequisites: Python 3.10+, ffmpeg (`brew install ffmpeg`)
- The script skips slugs that already have an MP3; use `--force` to regenerate

### AI Chat (RAG Pattern)

`src/app/api/chat/route.ts`: User query -> embedding (text-embedding-ada-002) -> pgvector similarity search on `embeddings` table -> top 3 chunks as context -> GPT-4o response with Lorenzo's persona.

Key files: `src/lib/embeddings.ts` (search), `src/lib/generateEmbeddings.ts` (CLI indexer)

### API Route Patterns

All API routes in `src/app/api/` should follow:
1. Validate input with Zod schemas from `src/lib/validations.ts`
2. CSRF protection via `validateCsrf()` from `src/lib/csrf.ts` for POST/DELETE
3. Rate limiting with `withRateLimit()` from `src/lib/rate-limit.ts` (falls back from Redis to in-memory)
4. Use `logError()` from `src/lib/logger.ts` instead of console.error
5. Sanitize with helpers from `src/lib/sanitize.ts`

### Middleware (`src/middleware.ts`)

Handles cache control (1yr static assets, 5min HTML, no-cache API), security headers, and www -> apex domain redirect.

### Component Architecture

- `src/components/blog/BlogLayout.tsx` - Wraps all blog posts: view counter, reactions, series nav, TTS player, social share, ads, JSON-LD structured data
- `src/components/ui/` - Base UI (navbar, footer, cards, fallback-image)
- `src/components/ads/AdBanner.tsx` - Google AdSense with lazy loading
- `src/constants/` - App content data (products, navlinks, pricing, timeline, socials, questions) separated from components
- Design system: Tailwind CSS (`tailwind.config.ts`), shadcn/ui (`components.json`), Framer Motion (`src/lib/animations.ts`)

### SEO

- Structured data: `src/components/ui/structured-data.tsx` (Schema.org JSON-LD)
- Metadata: `src/app/metadata.ts` (global defaults) + per-page Next.js metadata API
- Sitemap: `scripts/generate-sitemap.js` (auto-runs post-build)
- RSS: `src/app/api/rss/route.ts`

## Code Style

- 2-space indent, single quotes, no semicolons, trailing commas (ES5)
- Components: PascalCase files. Utilities: camelCase files
- Server Components by default; `"use client"` only when needed for interactivity
- Use `import { env } from '@/lib/env'` for type-safe env var access
- Images: WebP format, optimize with `cwebp -q 85 -resize 1920 0 input.jpg -o output.webp`
- Use `FallbackImage` component for blog hero images (auto-falls back to `/images/blog/default.webp`)

## Testing

- **Unit tests** (Vitest + React Testing Library): `src/__tests__/`, config in `vitest.config.ts`, happy-dom environment
- **E2E tests** (Playwright): `e2e/`, Chromium desktop + Safari iPhone 13
- **Test setup**: `src/__tests__/setup.tsx` mocks Next.js router, Image, matchMedia, IntersectionObserver
- **Neon mock pattern** for tests:
```typescript
const mockSql = vi.fn()
vi.mock('@/lib/db', () => ({
  getDb: vi.fn(() => mockSql),
  isDatabaseConfigured: vi.fn(() => true),
}))
mockSql.mockResolvedValue([{ column: 'value' }])
```

## Deployment

Vercel auto-deploys from `main` branch. Build: `next build` -> postbuild generates sitemap -> Vercel edge deployment.

**First-time setup:** Set env vars in Vercel, run Neon migration (`bun run scripts/run-neon-migration.ts`), generate embeddings (`bun run generate-embeddings`).
