# TODO

## Current Status

**Build:** ✅ Passing
**Tests:** ✅ 41 passing
**TypeScript:** ✅ No errors
**Last Updated:** 2025-11-29

---

## Immediate: Database Setup

**Create a new Supabase project (previous was paused):**

1. Go to https://supabase.com/dashboard → New Project
2. Run migrations in SQL Editor:
   - `supabase/migrations/20240122_init.sql` (embeddings)
   - `supabase/migrations/001_create_newsletter.sql` (newsletter)
   - `supabase/migrations/20250119_create_views_and_reactions_tables.sql` (engagement)
3. Update Vercel env vars with new credentials
4. Run `npm run generate-embeddings` for AI chat

---

## Deployment Checklist

- [x] Build passes
- [x] TypeScript compiles
- [x] Tests passing (41 tests)
- [x] CI/CD pipeline configured
- [ ] Supabase project created
- [ ] SQL migrations run
- [ ] Vercel env vars updated
- [ ] Deploy to Vercel

---

## Recently Completed

- [x] **Vitest testing framework** - 41 tests for lib utilities
- [x] **GitHub Actions CI/CD** - Lint, test, and build on push/PR
- [x] **Upstash Redis rate limiting** - Optional Redis-based rate limiting
- [x] **Giscus comments** - Environment-based configuration
- [x] **Security fixes** - Fixed high/critical npm vulnerabilities

---

## Optional Configuration

### Giscus Comments
1. Enable GitHub Discussions on your repo
2. Install Giscus app: https://github.com/apps/giscus
3. Get config from: https://giscus.app
4. Add to Vercel env vars:
   - `NEXT_PUBLIC_GISCUS_REPO_ID`
   - `NEXT_PUBLIC_GISCUS_CATEGORY_ID`

### Upstash Redis (for scale)
1. Create account at https://upstash.com
2. Create Redis database
3. Add to Vercel env vars:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

---

## Future Ideas

- [ ] E2E tests with Playwright
- [ ] Performance monitoring (Web Vitals)
- [ ] A/B testing for blog layouts
- [ ] Newsletter analytics dashboard
