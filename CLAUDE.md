# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**lscaturchio.xyz** is a modern personal portfolio and blog website built with Next.js 14 App Router, showcasing work in data science, web development, and AI integration. The site features:
- MDX-based blog with syntax highlighting and series support
- AI chat powered by OpenAI GPT-4o with RAG (retrieval-augmented generation)
- Engagement tracking (views, likes, bookmarks) with Neon PostgreSQL persistence
- Server-side rendering with React Server Components
- Vector search using Neon PostgreSQL for semantic blog content retrieval
- Comprehensive SEO with structured data and automated sitemap/RSS generation

**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, Neon PostgreSQL, OpenAI API, Framer Motion

## Development Commands

```bash
# Development
bun dev                        # Start dev server at localhost:3000
bun run lint                   # Run ESLint checks
bun run build                  # Production build (auto-generates sitemap)
bun start                      # Run production server locally

# Testing (use 'bun run' to invoke Vitest - 'bun test' uses Bun's incompatible runner)
bun run test                   # Run unit tests (Vitest)
bun run test:watch             # Run unit tests in watch mode
bun run test:coverage          # Run tests with coverage report
bun run test:e2e               # Run E2E tests (Playwright)
bun run test:e2e:ui            # Run E2E tests with interactive UI

# AI/Content
bun run generate-embeddings    # Generate OpenAI embeddings for blog content
bun run generate-sitemap       # Generate XML sitemap (auto-runs post-build)
```

**Environment Variables Required:**
- `OPENAI_API_KEY` - OpenAI API access for chat and embeddings
- `DATABASE_URL` - Neon PostgreSQL connection string

**Optional Environment Variables:**
- `GITHUB_TOKEN` - GitHub contributions graph (falls back to mock data if not set)
- `RESEND_API_KEY` - Contact form and newsletter emails (logs to console if not set)
- `CONTACT_EMAIL` - Destination email for contact form (default: lorenzo@lscaturchio.xyz)
- `CONTACT_FROM_EMAIL` - Sender address for contact form (default: contact@lscaturchio.xyz)
- `NEWSLETTER_FROM_EMAIL` - Sender address for newsletter welcome emails (default: newsletter@lscaturchio.xyz)
- `EMBEDDING_MATCH_THRESHOLD` - AI search similarity threshold 0-1 (default: 0.5)
- `NEXT_PUBLIC_SITE_URL` - Custom site URL (defaults to localhost in dev)
- `NEXT_PUBLIC_ADSENSE_CLIENT_ID` - Google AdSense publisher ID
- `UPSTASH_REDIS_REST_URL` - Upstash Redis for distributed rate limiting (falls back to in-memory)
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis token
- `VOTER_HASH_SALT` - Salt for privacy-preserving vote deduplication

See `.env.example` for details.

## Architecture Overview

### App Router Structure (Next.js 14)
- Server Components by default for performance
- Client Components (`"use client"`) only for interactivity
- Pages: `src/app/[route]/page.tsx`
- API Routes: `src/app/api/[route]/route.ts`
- Global layout: `src/app/layout.tsx` (fonts, metadata, analytics)

### Data Persistence & Engagement Architecture

**CRITICAL:** All engagement data (views, reactions) is stored in Neon PostgreSQL for persistence across deploys.

**Database Tables:**
```sql
-- View counts per blog post
views (
  slug TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)

-- Likes and bookmarks per blog post
reactions (
  slug TEXT PRIMARY KEY,
  likes INTEGER NOT NULL DEFAULT 0,
  bookmarks INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)

-- Blog content embeddings for AI chat
embeddings (
  id TEXT PRIMARY KEY,
  content TEXT,
  embedding vector(1536),
  metadata JSONB
)

-- Newsletter subscribers
newsletter_subscribers (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE,
  unsubscribed_at TIMESTAMP WITH TIME ZONE
)

-- Vote deduplication (prevents localStorage manipulation)
vote_records (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('like', 'bookmark')),
  voter_hash TEXT NOT NULL,  -- Privacy-preserving hash of IP
  created_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(slug, type, voter_hash)
)
```

**Shared Database Client (Neon):**
- Location: `src/lib/db.ts`
- Exports: `getDb()` function (returns Neon SQL tagged template client), `isDatabaseConfigured()` helper
- Package: `@neondatabase/serverless`
- Pattern: Lazy initialization to avoid build-time errors
- Used by: All API routes that need database access
- Query style: Tagged template literals (e.g., `` sql`SELECT * FROM views WHERE slug = ${slug}` ``)
- Returns: Plain arrays of row objects (no `.data`/`.error` wrapper)
- For raw SQL strings: Use `sql.query(stmt)` (NOT `sql(stmt)`, which throws an error)

**Engagement API Routes (use atomic RPC functions to prevent race conditions):**
1. **`/api/views`** - View tracking
   - GET: Fetch view count for a slug
   - POST: Increment view count (uses `increment_view_count()` RPC)
   - OPTIONS: Get all views with real blog titles

2. **`/api/reactions`** - Like/bookmark tracking with server-side deduplication
   - GET: Fetch reactions for a slug
   - POST: Add reaction (uses `record_vote()` RPC with voter hash, falls back to `toggle_reaction()`)
   - DELETE: Remove reaction (uses `remove_vote()` RPC, falls back to `decrement_reaction()`)

3. **`/api/engagement-stats`** - Aggregated metrics
   - Returns: totalLikes, totalBookmarks, topLiked[], topBookmarked[]
   - Used by: Analytics dashboard and stats page

4. **`/api/github/contributions`** - GitHub activity graph
   - GET: Fetch contribution data (requires GITHUB_TOKEN or returns mock)

5. **`/api/contact`** - Contact form
   - POST: Send email via Resend API (or logs to console if RESEND_API_KEY not set)

**First-Time Setup:**
After cloning the repository, you MUST run the Neon database migration:
1. Set the `DATABASE_URL` environment variable to your Neon connection string
2. Run the combined migration: `bun run scripts/run-neon-migration.ts`
   - Migration file: `supabase/migrations/neon_combined_migration.sql`
   - The runner uses `sql.query()` to execute raw SQL
3. Verify tables exist: `SELECT * FROM views; SELECT * FROM reactions; SELECT * FROM vote_records;`

See `supabase/migrations/README.md` for detailed instructions.

### Content Management (MDX)

**Blog Post Structure** - Each blog post requires two files:

1. **`src/app/blog/[slug]/content.mdx`** - The blog content with metadata export:
```mdx
export const meta = {
  title: "Blog Title",
  description: "Brief description",
  date: "2024-01-15",
  image: "/images/blog/image.webp",
  tags: ["tag1", "tag2"],
  series: "Series Name",      // Optional: Group posts into series
  seriesOrder: 1,              // Optional: Order within series
}

## Your Blog Content Here
...
```

2. **`src/app/blog/[slug]/page.tsx`** - The page wrapper:
```tsx
import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Blog Title",
  description: "Brief description",
  date: "2024-01-15",
  image: "/images/blog/image.webp",
  tags: ["tag1", "tag2"],
  series: "Series Name",       // Must match content.mdx
  seriesOrder: 1,              // Must match content.mdx
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
```

**Important:** Due to TypeScript module resolution, meta must be defined locally in `page.tsx` - you cannot import it from the MDX file. Always duplicate the meta object in both files.

**Blog Series System:**
- Group related posts using `series` and `seriesOrder` fields
- Series navigation automatically appears on posts with series metadata
- `/series` page displays all series with their posts
- Related posts component prioritizes same-series posts
- RSS feed includes series information

The `getAllBlogs()` function in `src/lib/getAllBlogs.ts` reads all blog directories (both `*.mdx` and `*/content.mdx` patterns) and extracts metadata at build time for static generation.

### AI Chat Architecture (RAG Pattern)
Located in `src/app/api/chat/route.ts`:

1. User sends message to `/api/chat`
2. Generate embedding of user query (OpenAI text-embedding-ada-002)
3. Search `embeddings` table using vector similarity query
4. Retrieve top 3 most similar blog content chunks
5. Build context with retrieved content
6. Send to GPT-4o-2024-08-06 with Lorenzo's first-person persona prompt
7. Return JSON response with answer (non-streaming)

**Key files:**
- `src/lib/db.ts` - Shared Neon database client
- `src/lib/embeddings.ts` - Embedding generation and search
- `src/lib/generateEmbeddings.ts` - CLI tool to pre-process blog content
- `src/app/api/chat/route.ts` - Chat endpoint (model: gpt-4o-2024-08-06, temp: 0.4, max_tokens: 1000)

### Middleware Patterns (`src/middleware.ts`)
Handles request/response optimization:
- **Cache Control by Content Type:**
  - Static assets (JS, CSS, images): 1 year cache with `must-revalidate`
  - HTML pages: 5 min cache with 60s `stale-while-revalidate`
  - API responses: no client cache (`no-cache, no-store`)
- **Security Headers:** XSS protection, clickjacking prevention, nosniff
- **www Redirect:** Normalizes `www.lscaturchio.xyz` → `lscaturchio.xyz`

### Testing Architecture

**Unit Tests (Vitest + React Testing Library):**
- Location: `src/__tests__/`
- Config: `vitest.config.ts`
- Environment: `happy-dom`
- Setup file: `src/__tests__/setup.tsx` (mocks Next.js router, Image, matchMedia, IntersectionObserver)
- Run single test: `bun test src/__tests__/lib/utils.test.ts`

**E2E Tests (Playwright):**
- Location: `e2e/`
- Config: `playwright.config.ts`
- Browsers: Chromium (Desktop), Safari (iPhone 13)
- Requires dev server running (auto-started by Playwright)
- Run specific test: `bun run test:e2e -- e2e/blog.spec.ts`

### Component Architecture
```
src/components/
├── ui/              # Base UI components (navbar, footer, cards, etc.)
├── ads/             # Google AdSense integration components
├── blog/            # Blog-specific components (BlogLayout, Prose, etc.)
├── stats/           # Engagement stats components (popular-posts, etc.)
├── [page]/          # Page-specific components (home/, blog/, about/, etc.)
├── hooks/           # Custom React hooks
└── [shared]         # Shared components (Badge, Container, Heading, etc.)
```

**Design System:**
- Tailwind CSS with custom theme in `tailwind.config.ts`
- shadcn/ui base components configured in `components.json`
- CSS custom properties for theming (see `src/app/globals.css`)
- Framer Motion variants in `src/lib/animations.ts`

### Key Blog Components

**BlogLayout** (`src/components/blog/BlogLayout.tsx`)
Wraps all blog posts with consistent features:
- **View Counter**: Automatically tracks and displays view count
- **Reading Progress**: Visual progress bar and localStorage tracking
- **Blog Reactions**: Like and bookmark buttons
- **Series Navigation**: Previous/next navigation for series posts
- **Text-to-Speech**: Extracted to `text-to-speech.tsx` - browser-native speech synthesis
- **Social Share**: Twitter, LinkedIn, Reddit, Email sharing
- **JSON-LD Structured Data**: Extracted to `blog-json-ld.tsx` - automatic BlogPosting schema
- **AdBanner Integration**: 4 ad units per post (top banner, 2 in-article ads, bottom banner)
- **Breadcrumb Navigation**: Auto-generated from URL path
- **FallbackImage**: Hero image with automatic fallback to default.webp

Uses Next.js `usePathname()` hook for SSR-safe slug extraction.

**BlogCard** (`src/components/blog/BlogCard.tsx`)
Used on blog listing pages:
- Shows blog progress badge (read/unread status from localStorage)
- Displays view count
- Animated hover effects with Framer Motion

**FallbackImage** (`src/components/ui/fallback-image.tsx`)
Image component with graceful error handling:
- Automatically falls back to `/images/blog/default.webp` on load failure
- Resets error state when src changes
- Prevents infinite error loops
- Wraps Next.js Image component

**AdBanner** (`src/components/ads/AdBanner.tsx`)
Google AdSense integration:
- Client-side ad loading with proper cleanup
- Supports formats: auto, rectangle, horizontal, vertical
- Responsive by default
- Shows "Advertisement" label for transparency
- Ad client ID: `ca-pub-4505962980988232`

### Constants Pattern
App data stored in `src/constants/`:
- `products.tsx` - Portfolio projects with metadata
- `navlinks.tsx` - Navigation structure
- `pricing.tsx` - Service pricing tiers
- `timeline.tsx` - Work experience timeline
- `socials.tsx` - Social media links
- `questions.tsx` - FAQ questions for services page

This pattern separates content from components for easier updates.

## Key Technical Patterns

### Performance Optimizations
1. **Next.js Config (`next.config.mjs`):**
   - Removes console logs in production
   - Webpack chunk optimization (max 25 initial requests)
   - CSS optimization and scroll restoration
   - SWC minification

2. **Image Optimization Strategy:**
   - **WebP format for all images** - All images converted to WebP using cwebp
   - **Recent optimization results** (Jan 2025):
     - Total reduction: 23.7MB → 2.4MB (89.9% decrease)
     - coachella.webp: 16MB → 840KB (94.8%)
     - about.webp: 3MB → 215KB (92.8%)
     - portrait.webp: 1.1MB → 124KB (88.7%)
     - default.webp: 997KB → 57KB (94.3%)
   - **Optimization command**: `cwebp -q 85 -resize <max-dimension> 0 input.jpg -o output.webp`
   - Sharp for further optimization at build time
   - Multiple device sizes via Next.js Image component
   - FallbackImage component for error handling
   - DNS prefetch for external image domains

3. **Loading Patterns:**
   - Suspense boundaries for async data (Navbar, Footer, ContactCTA)
   - Streaming with Server Components
   - Lazy loading for non-critical components
   - Google AdSense loaded with `strategy="lazyOnload"`
   - Content-visibility CSS for off-screen content

### SEO Implementation
1. **Structured Data (`src/components/ui/structured-data.tsx`):**
   - Schema.org markup: Website, Person, FAQ, Breadcrumb schemas
   - Automatic JSON-LD injection per page

2. **Metadata:**
   - Global defaults in `src/app/metadata.ts`
   - Per-page metadata via Next.js metadata API
   - Open Graph and Twitter card support

3. **Generated Content:**
   - XML sitemap: `scripts/generate-sitemap.js` (auto-runs post-build)
   - RSS feed: `src/app/api/rss/route.ts`

### Security Patterns
- API keys never in client code (use server-side only)
- Database connection string (`DATABASE_URL`) restricted to server-side API routes
- Security headers in middleware

**Environment Variable Validation (`src/lib/env.ts`):**
Uses `@t3-oss/env-nextjs` for runtime validation with Zod schemas:
- **Automatic validation** - Throws errors at build/startup for missing required vars
- **Type-safe access** - Full TypeScript support via `env.VARIABLE_NAME`
- **Server/client separation** - Server vars throw if accessed on client
- **Empty string handling** - Empty strings treated as undefined

Usage:
```typescript
import { env } from '@/lib/env'

// Type-safe access to environment variables
const dbUrl = env.DATABASE_URL                 // Required - throws if missing
const githubToken = env.GITHUB_TOKEN           // Optional - returns undefined
const threshold = env.EMBEDDING_MATCH_THRESHOLD // Transformed to number with default 0.5
```

Required variables:
- `DATABASE_URL` - Neon PostgreSQL connection string

To skip validation (e.g., Docker builds): Set `SKIP_ENV_VALIDATION=true`

**API Security Utilities:**
- `src/lib/csrf.ts` - CSRF protection via Origin header validation (POST/DELETE routes)
- `src/lib/validations.ts` - Zod schemas for type-safe input validation
- `src/lib/sanitize.ts` - HTML escaping, email validation, slug validation
- `src/lib/rate-limit.ts` - In-memory rate limiting with IP detection
- `src/lib/rate-limit-redis.ts` - Upstash Redis rate limiting (production)
- `src/lib/voter-hash.ts` - Privacy-preserving voter identification for deduplication

### Google AdSense Integration
**Setup:**
- AdSense script loaded in `src/app/layout.tsx` with `strategy="lazyOnload"`
- Publisher ID: `ca-pub-4505962980988232`
- DNS prefetch and preconnect for `pagead2.googlesyndication.com`

**Ad Placement:**
- Blog posts: 4 ad units per post via BlogLayout
  - Top banner (slot: "1234567890")
  - In-article ad after 3rd paragraph (slot: "2345678901")
  - In-article ad after 8th paragraph (slot: "3456789012")
  - Bottom banner (slot: "4567890123")
- All ads use AdBanner component with proper cleanup

**Best Practices:**
- Ads load lazily to avoid impacting initial page load
- "Advertisement" labels for transparency
- Responsive ad units adapt to device size
- Proper cleanup on component unmount

## Critical Files Reference

| File | Purpose |
|------|---------|
| `src/lib/env.ts` | Runtime environment variable validation (@t3-oss/env-nextjs) |
| `src/lib/db.ts` | Shared Neon PostgreSQL client (`getDb()`, `isDatabaseConfigured()`) |
| `src/lib/validations.ts` | Zod schemas for API input validation |
| `src/lib/csrf.ts` | CSRF protection for mutating endpoints |
| `src/lib/sanitize.ts` | Input sanitization (email, slug, HTML) |
| `src/lib/rate-limit.ts` | In-memory rate limiting |
| `src/lib/rate-limit-redis.ts` | Redis rate limiting for production |
| `src/lib/voter-hash.ts` | Privacy-preserving vote deduplication |
| `src/lib/email.ts` | Email utilities (newsletter welcome email) |
| `src/lib/logger.ts` | Structured logging utility (use instead of console.*) |
| `src/lib/embeddings.ts` | OpenAI embedding generation and Neon vector search |
| `src/lib/getAllBlogs.ts` | Scans blog directories, extracts MDX metadata |
| `src/app/api/views/route.ts` | View tracking API (Neon PostgreSQL backed) |
| `src/app/api/reactions/route.ts` | Like/bookmark API with vote deduplication |
| `src/app/api/chat/route.ts` | AI chat endpoint with RAG pattern (GPT-4o-2024-08-06) |
| `src/app/api/newsletter/subscribe/route.ts` | Newsletter subscription with welcome email |
| `src/app/layout.tsx` | Root layout: fonts, analytics, AdSense, global Suspense boundaries |
| `src/components/blog/BlogLayout.tsx` | Blog wrapper: view counter, reactions, series nav, text-to-speech, share, ads |
| `src/middleware.ts` | Request handling, caching, security headers, www redirect |
| `next.config.mjs` | Next.js config: performance, MDX, images, webpack |
| `tailwind.config.ts` | Design system: colors, typography, dark mode |
| `src/constants/` | All app content data (projects, nav, pricing, etc.) |
| `supabase/migrations/neon_combined_migration.sql` | Combined Neon database migration (all tables) |
| `scripts/run-neon-migration.ts` | Migration runner for Neon PostgreSQL |
| `vitest.config.ts` | Unit test configuration (Vitest + happy-dom) |
| `playwright.config.ts` | E2E test configuration (Playwright) |

## Common Development Tasks

### Adding a New Blog Post
1. Create directory: `src/app/blog/[slug]/`
2. Create `content.mdx` with meta export:
   ```mdx
   export const meta = {
     title: "Your Title",
     description: "Your description",
     date: "2024-01-15",
     image: "/images/blog/your-image.webp",
     tags: ["tag1", "tag2"],
     series: "Optional Series Name",  // Optional
     seriesOrder: 1,                  // Optional
   }

   ## Your content here...
   ```
3. Create `page.tsx` wrapper:
   ```tsx
   import { BlogLayout } from "@/components/blog/BlogLayout";
   import Content from "./content.mdx";

   const meta = {
     title: "Your Title",
     description: "Your description",
     date: "2024-01-15",
     image: "/images/blog/your-image.webp",
     tags: ["tag1", "tag2"],
     series: "Optional Series Name",  // Must match content.mdx
     seriesOrder: 1,                  // Must match content.mdx
   };

   export default function Page() {
     return (
       <BlogLayout meta={meta}>
         <Content />
       </BlogLayout>
     );
   }
   ```
4. **Important:** Meta object must be duplicated in both files (TypeScript limitation)
5. Add blog image to `public/images/blog/` (use WebP format, optimize with cwebp)
6. Run `bun run generate-embeddings` to index for AI chat
7. Build to regenerate sitemap: `bun run build`

### Creating a Blog Series
To group related blog posts into a series:
1. Add `series` and `seriesOrder` fields to blog post metadata
2. Use the same series name across all related posts
3. Assign sequential `seriesOrder` values (1, 2, 3, ...)
4. Series navigation will automatically appear on posts
5. The `/series` page will list all series

### Adding a Portfolio Project
1. Edit `src/constants/products.tsx`
2. Add new object with: title, link, thumbnail, images, description
3. Component auto-updates via map in `src/app/projects/page.tsx`

### Modifying AI Chat Behavior
1. Persona prompt in `src/app/api/chat/route.ts` (line ~45)
2. Adjust RAG parameters:
   - Similarity threshold: `matchEmbeddings()` in `embeddings.ts`
   - Number of retrieved chunks: `matchThreshold` and result limit
   - GPT model: `model: "gpt-4o"` in chat route
3. Test with `bun dev` → Navigate to chat page

### Styling Changes
- **Theme colors:** Edit `tailwind.config.ts` custom color vars
- **Global styles:** `src/app/globals.css` (base, utilities, component styles)
- **Component variants:** Use CVA pattern (see existing components)
- **Dark mode:** Toggle class on root element, styles auto-apply

### Updating Navigation
1. Edit `src/constants/navlinks.tsx`
2. Structure: `{ name, link, external? }`
3. Desktop nav: `src/components/ui/navbar.tsx`
4. Mobile nav: `src/components/ui/mobile-navbar.tsx`

### Optimizing Images
When adding new images, always optimize them:
```bash
# Install cwebp (part of webp package)
brew install webp  # macOS
apt-get install webp  # Ubuntu

# Optimize image (85% quality, max 1920px width)
cwebp -q 85 -resize 1920 0 input.jpg -o output.webp

# For smaller images (thumbnails, portraits)
cwebp -q 85 -resize 1200 0 input.jpg -o output.webp
```

**Best practices:**
- Target quality: 85% (good balance between size and quality)
- Max dimensions: 1920px for hero images, 1200px for standard images
- Always use WebP format
- Test load time after optimization
- Use FallbackImage component for automatic fallback

## Deployment

**Vercel Auto-Deploy:**
- Push to `main` branch triggers production deployment
- Environment variables configured in Vercel dashboard
- Preview deployments for all branches
- Automatic HTTPS and CDN distribution

**Build Process:**
1. `next build` - Generates optimized static/server pages
2. Post-build hook: `bun run generate-sitemap`
3. Vercel deploys to global edge network

**First Deploy Checklist:**
1. Configure environment variables in Vercel
2. Run Neon database migration (`bun run scripts/run-neon-migration.ts`)
3. Generate embeddings: `bun run generate-embeddings`
4. Verify build passes locally: `bun run build`
5. Push to main branch

## Important Notes

### Data Persistence
- **CRITICAL:** Views and reactions are stored in Neon PostgreSQL
- **First-time setup:** Run the combined migration via `bun run scripts/run-neon-migration.ts`
- **Migration file:** `supabase/migrations/neon_combined_migration.sql`
- **Migration guide:** See `supabase/migrations/README.md` for detailed instructions
- **Verification:** After migration, test API endpoints to ensure data persists

### Blog Posts
- **Meta object must be duplicated** - Define meta in both `content.mdx` AND `page.tsx` (TypeScript limitation prevents importing from MDX)
- **Date format**: Use "YYYY-MM-DD" format in meta.date field
- **Series metadata**: Optional but recommended for tutorial content
- **Embeddings must be regenerated** after blog content changes for AI chat to reflect updates: `bun run generate-embeddings`
- **All blog posts get 4 ads** automatically via BlogLayout (top, 2 in-article, bottom)
- **Text-to-speech is built-in** - BlogLayout provides Play/Pause controls
- **Engagement tracking**: Views auto-tracked on page load, reactions require user interaction

### Images
- **WebP format required** for all images (use `cwebp -q 85` for optimization)
- **Recent optimization** reduced total image size by 89.9% (23.7MB → 2.4MB)
- **Use FallbackImage component** for blog hero images (auto-falls back to default.webp)
- **Blog image path**: `/images/blog/[name].webp`

### Build & Deploy
- **Sitemap auto-generates on build** via postbuild hook
- **Middleware caching is aggressive** - test in production-like environment
- **Git hooks via Husky** - Pre-commit linting (configured in `.husky/`)

### Code Quality
- **TypeScript strict mode enabled** - all code must be type-safe
- **No console.log in production** - automatically removed by Next.js config
- **ESLint errors must be fixed** - especially unescaped entities (use `&apos;` for apostrophes in JSX)
- **Accessibility is enforced** - descriptive alt text required for all images

### Testing
- **Unit tests**: 98 tests in `src/__tests__/` (sanitize, rate-limit, csrf, validations, utils, formatDate, reading-time)
- **E2E tests**: 13 tests in `e2e/` (navigation, blog, search)
- **Test before PR**: Run `bun test && bun run test:e2e` before submitting changes
- **Mocks provided**: Next.js router, Image, matchMedia, IntersectionObserver mocked in setup file
- **Run single test**: `bun test src/__tests__/lib/validations.test.ts`

### API Keys & Security
- **API keys server-side only** - never expose in client code
- **Database connection string** (`DATABASE_URL`) restricted to server-side only
- **Google AdSense Publisher ID**: Configured via `NEXT_PUBLIC_ADSENSE_CLIENT_ID` env var

### Adding New API Routes
When creating new API routes, use these patterns:
1. Import validation schemas from `src/lib/validations.ts` (or add new Zod schemas)
2. Use `parseBody()` or `parseQuery()` helpers for input validation
3. Add CSRF protection with `validateCsrf()` for POST/DELETE endpoints
4. Use `logError()` from `src/lib/logger.ts` instead of console.error
5. Apply rate limiting with `withRateLimit()` wrapper for public endpoints
