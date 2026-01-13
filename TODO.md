# TODO

## Current Status

**Build:** ✅ Passing
**Unit Tests:** ✅ 98 passing
**E2E Tests:** ✅ 26 passing (Chromium + Mobile Safari)
**TypeScript:** ✅ 5.9.3
**Sentry:** ✅ Configured (enable via env vars)
**Last Updated:** 2026-01-12

---

## Recent Codebase Fixes (Jan 2025)

### Critical Fixes Applied
- [x] **Root layout SSR restored** - Removed `"use client"` from layout.tsx, extracted client logic to separate components ([layout-wrapper.tsx](src/components/layout/layout-wrapper.tsx), [canonical-link.tsx](src/components/layout/canonical-link.tsx))
- [x] **HTML sanitization** - Added XSS protection for contact form emails ([sanitize.ts](src/lib/sanitize.ts))
- [x] **Rate limiter IP detection** - Fixed fallback from `'unknown'` to fingerprint-based identification, added support for Cloudflare/Akamai headers ([rate-limit.ts:136-174](src/lib/rate-limit.ts#L136-L174))
- [x] **Blog formatting** - Fixed 3 blogs missing BlogLayout wrapper (ai-puzzle, understanding-ego, investing-in-monero)
- [x] **Test dependencies** - Fixed invalid vite/vitest versions causing ESM errors

### Improvements Applied
- [x] **TIL section** - Updated with AI-focused content (RAG, embeddings, Claude, LangChain)
- [x] **Neumorphic styling** - Applied to search, theme toggle, TIL grid
- [x] **Next.js deprecation** - Changed `onLoadingComplete` to `onLoad` in OptimizedImage

---

## Immediate: Database Setup

**Create a new Supabase project (previous was paused):**

1. Go to https://supabase.com/dashboard → New Project
2. Run migrations in SQL Editor:
   - `supabase/migrations/20240122_init.sql` (embeddings)
   - `supabase/migrations/001_create_newsletter.sql` (newsletter)
   - `supabase/migrations/20250119_create_views_and_reactions_tables.sql` (engagement)
   - `supabase/migrations/20250111_add_decrement_reaction.sql` (atomic decrement for unlike/unbookmark)
3. Update Vercel env vars with new credentials
4. Run `npm run generate-embeddings` for AI chat

---

## Test Commands

```bash
npm test              # Unit tests (Vitest)
npm run test:watch    # Unit tests in watch mode
npm run test:e2e      # E2E tests (Playwright - Chromium)
npm run test:e2e:ui   # E2E tests with UI
```

---

## Deployment Checklist

- [x] Build passes
- [x] TypeScript compiles
- [x] Unit tests passing (41 tests)
- [x] E2E tests passing (13 tests)
- [x] CI/CD pipeline with E2E
- [ ] Supabase project created
- [ ] SQL migrations run
- [ ] Vercel env vars updated
- [ ] Deploy to Vercel

---

## Code Review Issues (Jan 2025)

### High Priority
- [x] **E2E tests reference deleted blogs** - Fixed: Updated to use `/blog/building-rag-systems`
- [x] **BlogLayout is too large** - Fixed: Extracted `TextToSpeech` and `BlogJsonLd` components, using Next.js `usePathname` hook
- [x] **Race conditions in engagement tracking** - Fixed: Now uses atomic RPC functions (`increment_view_count`, `toggle_reaction`, `decrement_reaction`)
- [x] **Hardcoded email in contact route** - Fixed: Now uses `CONTACT_EMAIL` and `CONTACT_FROM_EMAIL` env vars

### Medium Priority
- [x] **Remove unused rate-limit-redis.ts** - Fixed: Deleted unused file
- [x] **API versioning inconsistency** - Fixed: Migrated `recent-blogs.tsx` to v1 API, deleted `/api/blogs/route.ts`
- [x] **Magic numbers in embedding search** - Fixed: Now uses `EMBEDDING_MATCH_THRESHOLD` env var (default: 0.5)
- [x] **Document new env vars** - Fixed: Added `CONTACT_EMAIL`, `CONTACT_FROM_EMAIL`, `EMBEDDING_MATCH_THRESHOLD` to `.env.example`
- [x] **Logger migration** - Migrated all 18 API routes from console.error to logError() utility
- [x] **Update CLAUDE.md** - Fixed: Added new env vars, atomic RPC docs, v1 API, extracted components, logger utility

### Low Priority
- [x] **Mobile Safari tests** - Installed webkit, 26 tests passing (13 × 2 browsers)
- [x] **Sentry integration** - Full client/server/edge error tracking configured ([sentry.client.config.ts](sentry.client.config.ts), [sentry.server.config.ts](sentry.server.config.ts))
- [x] **Analytics dashboard** - Newsletter subscriber stats page ([/analytics](src/app/analytics/page.tsx))

---

## New Code Review Issues (Jan 2026)

### Critical (Fix Before Deploy)
- [x] **In-memory rate limiting ineffective** - Fixed: Added Redis rate limiting via Upstash with automatic in-memory fallback ([rate-limit-redis.ts](src/lib/rate-limit-redis.ts))
- [x] **Missing CSRF protection** - Fixed: Added origin header validation to POST/DELETE endpoints ([csrf.ts](src/lib/csrf.ts))
- [x] **OpenAI client no timeout** - Fixed: Added `timeout: 30000` and `maxRetries: 1` to all OpenAI clients
- [x] **No slug validation** - Fixed: Added `isValidSlug()` with regex `/^[a-z0-9-]+$/` to views and reactions routes

### High Priority
- [x] **Weak email regex** - Fixed: Added robust `isValidEmail()` function that validates TLD length, disallows consecutive dots ([sanitize.ts](src/lib/sanitize.ts))
- [x] **Duplicate Supabase client** - Fixed: Newsletter routes now use shared `getSupabase()` from `@/lib/supabase`
- [x] **No idempotency for reactions** - Fixed: Added `useRef` locking in `blog-reactions.tsx` to prevent double-click race conditions
- [x] **Missing Error Boundary** - Fixed: Added `ErrorBoundary` component to layout wrapper ([layout-wrapper.tsx](src/components/layout/layout-wrapper.tsx))
- [x] **localStorage vote manipulation** - Fixed: Added server-side vote deduplication via IP hash ([voter-hash.ts](src/lib/voter-hash.ts), [vote_deduplication.sql](supabase/migrations/20250112_add_vote_deduplication.sql))

### Medium Priority
- [x] **Newsletter unsubscribe incomplete** - Fixed: Welcome email now includes unsubscribe link ([email.ts](src/lib/email.ts))
- [x] **Newsletter stores IP/user-agent** - Fixed: Removed IP/user-agent storage from newsletter subscribe for GDPR compliance
- [x] **Hardcoded site URLs** - Fixed: v1 API routes and blog components now use `NEXT_PUBLIC_SITE_URL` environment variable
- [x] **No Zod validation** - Fixed: Added Zod schemas for type-safe validation ([validations.ts](src/lib/validations.ts)) - contact, views, reactions, newsletter routes
- [x] **Missing BlogPosting structured data** - Fixed: BlogJsonLd component already exists and was updated to use SITE_URL env var
- [x] **No API route tests** - Fixed: Added CSRF, sanitization, and Zod validation tests. Total: 98 unit tests
- [x] **Pagination validation** - Fixed: Added `validatePagination()` function with bounds checking ([sanitize.ts](src/lib/sanitize.ts))

### Low Priority
- [x] **Hardcoded AdSense publisher ID** - Fixed: Moved to `NEXT_PUBLIC_ADSENSE_CLIENT_ID` env var in [AdBanner.tsx](src/components/ads/AdBanner.tsx), [InArticleAd.tsx](src/components/ads/InArticleAd.tsx), [layout.tsx](src/app/layout.tsx)
- [x] **Outdated dependencies** - Fixed: TypeScript 5.9.3, Supabase 2.90.1, Upstash Redis 1.36.1, happy-dom 20.1.0. Major upgrades (React 19, Next.js 15, Tailwind 4) evaluated and deferred - breaking changes significant, current stack stable.
- [x] **Missing loading accessibility** - Fixed: Added `aria-busy` and `role="presentation"` to loading skeletons in blog-stats, popular-posts, blog-reactions, engagement-stats, recent-blogs

---

## Remaining Improvements

### Optional Features
- [x] **Analytics dashboard** - Newsletter subscriber stats page ([/analytics](src/app/analytics/page.tsx), [/api/analytics](src/app/api/analytics/route.ts))
- [x] **A/B testing** - Infrastructure and hooks ([ab-testing.ts](src/lib/ab-testing.ts), [useABTest.ts](src/hooks/useABTest.ts))
- [x] **Interactive showcases** - Three.js project components ([interactive-project-card.tsx](src/components/three/interactive-project-card.tsx), [interactive-showcase.tsx](src/components/projects/interactive-showcase.tsx))

### Production Deployment
- [ ] Create new Supabase project (run migrations)
- [ ] Configure Vercel environment variables
- [ ] Optional: Set up Sentry project (get DSN)
- [ ] Optional: Set up Upstash Redis (for distributed rate limiting)
- [ ] Run `npm run generate-embeddings` for AI chat

---

## Recently Completed

### Testing & CI/CD
- [x] **Vitest testing framework** - 98 unit tests (sanitize, rate-limit, csrf, validations, utils, formatDate, reading-time)
- [x] **Playwright E2E tests** - Navigation, blog, search tests
- [x] **GitHub Actions CI/CD** - Lint → Test → Build → E2E pipeline

### Visual Enhancements
- [x] **Three.js particle background** - Interactive 3D hero section
- [x] **Gradient orb effect** - Alternative 3D background
- [x] **Performance-aware rendering** - Reduces particles on low-end devices
- [x] **Respects prefers-reduced-motion** - Accessibility

### Performance
- [x] **Web Vitals monitoring** - CLS, LCP, FID, TTFB tracking
- [x] **Performance observer** - Long task detection

### Infrastructure
- [x] **Upstash Redis rate limiting** - Optional distributed rate limiting
- [x] **Giscus comments** - Environment-based configuration
- [x] **Dynamic OG images** - `/api/og` endpoint
- [x] **Custom 404 page** - Professional error page
- [x] **Skip to content** - Accessibility improvement

---

## Optional Configuration

### Giscus Comments
```env
NEXT_PUBLIC_GISCUS_REPO_ID=your-repo-id
NEXT_PUBLIC_GISCUS_CATEGORY_ID=your-category-id
```

### Upstash Redis
```env
UPSTASH_REDIS_REST_URL=your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

### Performance Analytics
```env
NEXT_PUBLIC_ANALYTICS_ENDPOINT=your-analytics-endpoint
```

