# TODO

## Current Status

**Build:** ✅ Passing
**TypeScript:** ✅ No errors
**Last Updated:** 2025-01-29

---

## Immediate: Run SQL Migration

**Required before production deployment:**

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → SQL Editor
2. Run migration: `supabase/migrations/20250119_create_views_and_reactions_tables.sql`
3. Verify tables:
   ```sql
   SELECT * FROM views;
   SELECT * FROM reactions;
   ```

See `supabase/migrations/README.md` for full instructions.

---

## Deployment Checklist

- [x] Build passes
- [x] TypeScript compiles
- [x] API routes use Supabase persistence
- [ ] SQL migration run in Supabase
- [ ] Deploy to Vercel
- [ ] Verify engagement data persists

---

## Optional Testing

Manual browser testing (can be done post-deploy):

- [ ] Search filters and sort options
- [ ] Series navigation on blog posts
- [ ] Reading progress badges
- [ ] Social share buttons
- [ ] View counters on blog cards
- [ ] Like/bookmark reactions
- [ ] Popular posts component
- [ ] Mobile responsive

---

## Future Improvements

- [ ] Add automated tests (Jest/Vitest)
- [ ] Set up CI/CD pipeline with test coverage
- [ ] Add rate limiting with Redis for scale
- [ ] Implement Giscus comments on blog posts
