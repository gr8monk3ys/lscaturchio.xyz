# Project Rules

Conventions for working in `lscaturchio.xyz`. These describe how the code is
**actually** written today, not an aspirational target. When a rule and the
surrounding code disagree, trust the code and fix the rule.

See also: [CLAUDE.md](../../CLAUDE.md), [docs/repository-guide.md](../../docs/repository-guide.md),
[docs/operations.md](../../docs/operations.md).

## Stack

- Next.js 16 (App Router) + React 19
- TypeScript 5 (`strict: true`)
- Tailwind CSS v4
- Neon Postgres via `@neondatabase/serverless` (tagged-template SQL) — see `src/lib/db.ts`
- Vitest (unit/integration) + Playwright (e2e)
- Sentry (errors), Upstash (Redis rate limiting), OpenAI/OpenRouter/Ollama (chat)

## TypeScript

- `strict` is on. Do not introduce `any` — there are currently zero `any` types
  in `src/` outside tests; keep it that way (use `unknown` + narrowing).
- Avoid `@ts-ignore`/`@ts-expect-error` and `eslint-disable`; the codebase has
  essentially none.

## Formatting

There is **no Prettier config and no lint rule enforcing style** — ESLint is
stock `eslint-config-next` (core-web-vitals + typescript). So: **match the
surrounding file.** The de-facto conventions are:

- 2-space indentation
- Double quotes dominate (~240 files) but single quotes appear (~130); be
  locally consistent
- Semicolons are present in most files
- `export default` is allowed and common (~136 in `src/`); route handlers and
  pages use named exports (`GET`/`POST`) per Next conventions

## Naming

- Component identifiers: `PascalCase`. Functions/vars: `camelCase`.
  Module-level constants: `SCREAMING_SNAKE_CASE`.
- Component **filenames** are mixed: kebab-case is the de-facto majority, with
  some `PascalCase.tsx` holdouts. Prefer kebab-case for new files; don't rename
  existing files casually (imports are case-sensitive in CI).

## Structure

```
src/app/         routes, layouts, metadata, sitemap; route handlers under src/app/api
src/components/  page sections + reusable UI (src/components/ui)
src/lib/         shared helpers (chat/, db, embeddings, validations, rate-limit, csrf, ...)
src/hooks/       React hooks
src/types/       shared types
src/constants/   static data
src/generated/   build-generated sources (e.g. audio manifest) — do not hand-edit
```

Path alias: `@/*` → `src/*`.

## Components

- Server Components by default. Add `"use client"` only when a component needs
  state, effects, browser APIs, or event handlers.
- Use `next/image` for images.
- Respect `prefers-reduced-motion` via the `useMotionPreset` hook for animations.

## API routes

- Validate request bodies with Zod (`src/lib/validations.ts`, `parseBody`).
- Wrap handlers with `withRateLimit(handler, RATE_LIMITS.X)` (`src/lib/with-rate-limit.ts`).
- Call `validateCsrf(req)` on state-changing methods (`src/lib/csrf.ts`).
- Two response shapes exist today: a standard envelope via
  `src/lib/api-response.ts` (`apiSuccess` / `ApiErrors`, used by ~9 routes) and
  bespoke `NextResponse.json(...)` shapes (most public read routes). **Prefer
  the envelope for new routes**; when editing an existing route, match its
  neighbors rather than mixing shapes within one endpoint.
- Degrade gracefully when an optional dependency is unconfigured (DB, embeddings
  provider) rather than throwing — see existing routes for the pattern.

## Testing

- Unit/integration tests live in `src/__tests__/` (`*.test.ts(x)`), e2e in
  `e2e/` (`*.spec.ts`).
- Coverage thresholds (`vitest.config.ts`): statements 75 / branches 66 /
  functions 72 / lines 76. API and lib code is well covered; component coverage
  is thin — new components should add at least basic tests.
- Mock Neon by mocking `@/lib/db` (`getDb` → a `vi.fn()` returning row arrays).

## Security

- No secrets in code; configuration comes from env vars (`.env.example`).
- Validate all external input with Zod; rate-limit and CSRF-protect mutating
  endpoints; gate operator-only endpoints with `validateApiKey`
  (`src/lib/api-auth.ts`).

## Git

- Conventional Commits (`type(scope): subject`), imperative subject ≤ 72 chars.
- Don't commit local artifacts: `.next`, `coverage`, `playwright-report`,
  `test-results`, `.lighthouseci`, `.playwright-cli`, or `scripts/.tts-venv`.
- Regenerate `bun.lock` (run `bun install`) whenever `package.json` deps change,
  or CI's `bun install --frozen-lockfile` will fail.
