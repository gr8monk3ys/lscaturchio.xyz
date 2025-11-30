# TODO

## Current Status

**Build:** ✅ Passing
**Unit Tests:** ✅ 41 passing
**E2E Tests:** ✅ Playwright configured
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

## Test Commands

```bash
npm test              # Unit tests (Vitest)
npm run test:watch    # Unit tests in watch mode
npm run test:e2e      # E2E tests (Playwright)
npm run test:e2e:ui   # E2E tests with UI
```

---

## Deployment Checklist

- [x] Build passes
- [x] TypeScript compiles
- [x] Unit tests passing (41 tests)
- [x] E2E tests configured
- [x] CI/CD pipeline with E2E
- [ ] Supabase project created
- [ ] SQL migrations run
- [ ] Vercel env vars updated
- [ ] Deploy to Vercel

---

## Recently Completed

### Testing & CI/CD
- [x] **Vitest testing framework** - 41 unit tests
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

---

## Future Ideas

- [ ] A/B testing for blog layouts
- [ ] Newsletter analytics dashboard
- [ ] Interactive project showcases with Three.js
- [ ] Blog post reactions with animations
