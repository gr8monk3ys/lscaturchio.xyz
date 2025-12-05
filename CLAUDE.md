# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**lscaturchio.xyz** is a modern personal portfolio and blog website built with Next.js 14 App Router, showcasing work in data science, web development, and AI integration. The site features:
- MDX-based blog with syntax highlighting and series support
- AI chat powered by OpenAI GPT-4o with RAG (retrieval-augmented generation)
- Engagement tracking (views, likes, bookmarks) with Supabase persistence
- Server-side rendering with React Server Components
- Vector search using Supabase for semantic blog content retrieval
- Comprehensive SEO with structured data and automated sitemap/RSS generation
- Public REST API with documentation
- Three.js animated backgrounds with accessibility awareness
- Performance monitoring with Web Vitals tracking
- E2E testing with Playwright and unit testing with Vitest
- CI/CD pipeline with GitHub Actions

**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, Supabase, OpenAI API, Framer Motion, Three.js/React Three Fiber, Vitest, Playwright

## Development Commands

```bash
# Development
npm run dev                    # Start dev server at localhost:3000
npm run lint                   # Run ESLint checks
npm run build                  # Production build (auto-generates sitemap)
npm run start                  # Run production server locally

# Testing
npm run test                   # Run unit tests with Vitest
npm run test:watch             # Run tests in watch mode
npm run test:coverage          # Run tests with coverage report
npm run test:e2e               # Run Playwright E2E tests
npm run test:e2e:ui            # Run E2E tests with Playwright UI

# AI/Content
npm run generate-embeddings    # Generate OpenAI embeddings for blog content
npm run generate-sitemap       # Generate XML sitemap (auto-runs post-build)
```

**Environment Variables Required:**
- `OPENAI_API_KEY` - OpenAI API access for chat and embeddings
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase database URL
- `SUPABASE_SERVICE_KEY` - Server-side Supabase access (full permissions)

**Optional Environment Variables:**
- `GITHUB_TOKEN` - GitHub contributions graph (falls back to mock data if not set)
- `RESEND_API_KEY` - Contact form email sending (logs to console if not set)
- `NEXT_PUBLIC_SITE_URL` - Custom site URL (defaults to localhost in dev)
- `ANALYTICS_API_KEY` - Analytics endpoint protection

See `.env.example` for details.

## Architecture Overview

### App Router Structure (Next.js 14)
- Server Components by default for performance
- Client Components (`"use client"`) only for interactivity
- Pages: `src/app/[route]/page.tsx`
- API Routes: `src/app/api/[route]/route.ts`
- Global layout: `src/app/layout.tsx` (fonts, metadata, analytics)

### Data Persistence & Engagement Architecture

**CRITICAL:** All engagement data (views, reactions) is stored in Supabase PostgreSQL for persistence across deploys.

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
```

**Shared Supabase Client:**
- Location: `src/lib/supabase.ts`
- Exports: `getSupabase()` function
- Pattern: Lazy initialization to avoid build-time errors
- Used by: All API routes that need database access

**Engagement API Routes:**
1. **`/api/views`** - View tracking
   - GET: Fetch view count for a slug
   - POST: Increment view count (upsert pattern)
   - OPTIONS: Get all views with real blog titles

2. **`/api/reactions`** - Like/bookmark tracking
   - GET: Fetch reactions for a slug
   - POST: Increment reaction (like or bookmark)
   - DELETE: Decrement reaction (toggle off)

3. **`/api/engagement-stats`** - Aggregated metrics
   - Returns: totalLikes, totalBookmarks, topLiked[], topBookmarked[]
   - Used by: Analytics dashboard and stats page

4. **`/api/github/contributions`** - GitHub activity graph
   - GET: Fetch contribution data (requires GITHUB_TOKEN or returns mock)

5. **`/api/contact`** - Contact form
   - POST: Send email via Resend API (or logs to console if RESEND_API_KEY not set)

6. **`/api/search`** - Semantic search (rate limited: 5/min)
   - GET/POST: Search blog posts using vector embeddings
   - Returns: Grouped results with similarity scores and snippets

7. **`/api/summarize`** - AI summarization (rate limited: 5/min)
   - POST: Generate summary or key takeaways from content
   - Uses GPT-4o-mini for efficiency

**First-Time Setup:**
After cloning the repository, you MUST run the Supabase migration to create the views and reactions tables:
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migrations/20250119_create_views_and_reactions_tables.sql`
3. Execute the SQL migration
4. Verify tables exist: `SELECT * FROM views; SELECT * FROM reactions;`

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
3. Search Supabase `embeddings` table using `match_embeddings()` RPC
4. Retrieve top 3 most similar blog content chunks
5. Build context with retrieved content
6. Send to GPT-4o-2024-08-06 with Lorenzo's first-person persona prompt
7. Return JSON response with answer (non-streaming)

**Key files:**
- `src/lib/supabase.ts` - Shared Supabase client
- `src/lib/embeddings.ts` - Embedding generation and search
- `src/lib/generateEmbeddings.ts` - CLI tool to pre-process blog content
- `src/app/api/chat/route.ts` - Chat endpoint (model: gpt-4o-2024-08-06, temp: 0.4, max_tokens: 1000)

### Public REST API
The site exposes a public API for programmatic access to blog content. Documentation available at `/api-docs`.

**Versioned Endpoints (v1):**
- **`GET /api/v1/blogs`** - List all blogs with pagination
  - Query params: `limit`, `offset`, `tag`
  - Returns: `{ data: [...], meta: { total, limit, offset, hasMore } }`
- **`GET /api/v1/blogs/:slug`** - Get single blog post
- **`GET /api/v1/stats`** - Site statistics (post count, popular tags)

**Rate Limiting:**
All API endpoints use in-memory rate limiting (`src/lib/rate-limit.ts`):
- `AI_HEAVY`: 5 requests/minute (chat, search, summarize)
- `STANDARD`: 30 requests/minute
- `PUBLIC`: 100 requests/minute (blog listing)
- `NEWSLETTER`: 3 requests/5 minutes

**Key files:**
- `src/lib/rate-limit.ts` - Rate limiter implementation
- `src/lib/with-rate-limit.ts` - HOF wrapper for API routes
- `src/app/api/v1/` - Versioned public API endpoints
- `src/components/api/api-documentation.tsx` - API docs UI

### Testing Architecture

**Unit Tests (Vitest):**
- Location: `src/__tests__/`
- Config: `vitest.config.ts`
- Setup: `src/__tests__/setup.tsx` (mocks for Next.js, matchMedia, observers)
- Coverage: V8 provider with HTML/JSON/text reports

**E2E Tests (Playwright):**
- Location: `e2e/`
- Config: `playwright.config.ts`
- Browsers: Chromium (desktop) + Mobile Safari (iPhone 13)
- Tests: Navigation, blog listing, search, dark mode, accessibility

**CI/CD Pipeline (GitHub Actions):**
- Location: `.github/workflows/ci.yml`
- Jobs: lint → test → build → e2e (sequential with dependencies)
- Runs on: push/PR to main branch
- Artifacts: Playwright report on failure (7-day retention)

**Running Tests:**
```bash
npm test                    # Unit tests (single run)
npm run test:watch          # Unit tests (watch mode)
npm run test:coverage       # Unit tests with coverage
npm run test:e2e            # E2E tests (headless)
npm run test:e2e:ui         # E2E tests (interactive UI)
```

### Three.js Visual Effects
Located in `src/components/three/`:

**Components:**
- `ThreeBackground` - Main wrapper with type selection (particles/orb/none)
- `ParticleField` - Full particle animation
- `ParticleFieldLite` - Reduced particles for low-end devices
- `GradientOrb` - Animated gradient sphere

**Accessibility Features:**
- Respects `prefers-reduced-motion` media query
- Auto-detects low-end devices (< 4 CPU cores, mobile)
- Falls back to static background when motion disabled
- Dynamically imported to avoid SSR issues

### Performance Monitoring
Located in `src/components/analytics/web-vitals.tsx`:

**WebVitalsReporter:**
- Tracks Core Web Vitals: CLS, FID, FCP, LCP, TTFB, INP
- Rates metrics against Google thresholds (good/needs-improvement/poor)
- Logs to console in development
- Sends to analytics endpoint if `NEXT_PUBLIC_ANALYTICS_ENDPOINT` set

**PerformanceMonitor:**
- Monitors long tasks (> 50ms)
- Tracks memory usage in development
- Uses PerformanceObserver API

### Middleware Patterns (`src/middleware.ts`)
Handles request/response optimization:
- **Cache Control by Content Type:**
  - Static assets (JS, CSS, images): 1 year cache with `must-revalidate`
  - HTML pages: 5 min cache with 60s `stale-while-revalidate`
  - API responses: no client cache (`no-cache, no-store`)
- **Security Headers:** XSS protection, clickjacking prevention, nosniff
- **www Redirect:** Normalizes `www.lscaturchio.xyz` → `lscaturchio.xyz`

### Component Architecture
```
src/components/
├── ui/              # Base UI components (navbar, footer, cards, etc.)
├── ads/             # Google AdSense integration components
├── analytics/       # Web Vitals and performance monitoring
├── api/             # API documentation components
├── blog/            # Blog-specific components (BlogLayout, Prose, etc.)
├── chat/            # AI chat interface components
├── github/          # GitHub contributions display
├── hooks/           # Custom React hooks
├── newsletter/      # Newsletter subscription components
├── search/          # Search interface components
├── stats/           # Engagement stats components (popular-posts, etc.)
├── three/           # Three.js visual effects (particles, orbs)
├── [page]/          # Page-specific components (home/, about/, etc.)
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
- **Text-to-Speech**: Browser-native speech synthesis (Play/Pause controls)
- **Social Share**: Twitter, LinkedIn, Reddit, Email sharing
- **JSON-LD Structured Data**: Automatic BlogPosting schema generation
- **AdBanner Integration**: 4 ad units per post (top banner, 2 in-article ads, bottom banner)
- **Breadcrumb Navigation**: Auto-generated from URL path
- **FallbackImage**: Hero image with automatic fallback to default.webp

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
- Supabase service key restricted to API routes
- Security headers in middleware
- Type validation on API endpoints
- Row Level Security (RLS) on Supabase tables

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
| `src/lib/supabase.ts` | Shared Supabase client for data persistence |
| `src/app/api/views/route.ts` | View tracking API (Supabase backed) |
| `src/app/api/reactions/route.ts` | Like/bookmark API (Supabase backed) |
| `src/app/api/engagement-stats/route.ts` | Aggregated engagement metrics |
| `src/app/api/v1/blogs/route.ts` | Public API: blog listing with pagination |
| `src/app/api/search/route.ts` | Semantic search using embeddings |
| `src/app/api/summarize/route.ts` | AI-powered content summarization |
| `src/app/layout.tsx` | Root layout: fonts, analytics, AdSense, global Suspense boundaries |
| `src/lib/getAllBlogs.ts` | Scans blog directories, extracts MDX metadata (both `*.mdx` and `*/content.mdx`) |
| `src/lib/embeddings.ts` | OpenAI embedding generation and Supabase vector search |
| `src/lib/rate-limit.ts` | In-memory API rate limiter with presets |
| `src/lib/summarize.ts` | GPT-4o-mini summarization utilities |
| `src/app/api/chat/route.ts` | AI chat endpoint with RAG pattern (GPT-4o-2024-08-06) |
| `src/components/blog/BlogLayout.tsx` | Blog wrapper: view counter, reactions, series nav, text-to-speech, share, ads |
| `src/components/three/three-background.tsx` | Three.js animated backgrounds with accessibility |
| `src/components/analytics/web-vitals.tsx` | Core Web Vitals monitoring |
| `src/components/ui/fallback-image.tsx` | Image with automatic fallback to default.webp |
| `src/components/ads/AdBanner.tsx` | Google AdSense integration component |
| `src/middleware.ts` | Request handling, caching, security headers, www redirect |
| `next.config.mjs` | Next.js config: performance, MDX, images, webpack |
| `tailwind.config.ts` | Design system: colors, typography, dark mode |
| `src/constants/` | All app content data (projects, nav, pricing, etc.) |
| `src/app/metadata.ts` | Default site metadata (OG, Twitter, robots) |
| `supabase/migrations/` | Database schema migrations (views, reactions tables) |
| `vitest.config.ts` | Vitest unit test configuration |
| `playwright.config.ts` | Playwright E2E test configuration |
| `.github/workflows/ci.yml` | GitHub Actions CI/CD pipeline |

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
6. Run `npm run generate-embeddings` to index for AI chat
7. Build to regenerate sitemap: `npm run build`

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
3. Test with `npm run dev` → Navigate to chat page

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

### Writing Tests

**Unit Tests (Vitest):**
1. Create test file in `src/__tests__/` following pattern: `*.test.ts` or `*.spec.ts`
2. Import from `vitest`: `import { describe, it, expect, vi } from 'vitest'`
3. Use `@testing-library/react` for component tests
4. Mock Next.js router, Image, etc. (see `src/__tests__/setup.tsx` for examples)

Example:
```typescript
import { describe, it, expect } from 'vitest';
import { formatDate } from '@/lib/formatDate';

describe('formatDate', () => {
  it('formats ISO date correctly', () => {
    expect(formatDate('2024-01-15')).toBe('January 15, 2024');
  });
});
```

**E2E Tests (Playwright):**
1. Create test file in `e2e/` with pattern: `*.spec.ts`
2. Use Playwright's test runner: `import { test, expect } from '@playwright/test'`
3. Tests run against `http://localhost:3000` (dev server starts automatically)

Example:
```typescript
import { test, expect } from '@playwright/test';

test('can navigate to blog', async ({ page }) => {
  await page.goto('/');
  await page.click('a[href="/blog"]');
  await expect(page).toHaveURL('/blog');
});
```

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
2. Post-build hook: `npm run generate-sitemap`
3. Vercel deploys to global edge network

**First Deploy Checklist:**
1. Configure environment variables in Vercel
2. Run Supabase migration (views and reactions tables)
3. Generate embeddings: `npm run generate-embeddings`
4. Verify build passes locally: `npm run build`
5. Push to main branch

## MCP Configuration

Model Context Protocol servers configured in `.mcp.json`:
- **GitHub MCP** - Repository operations
- **Vercel MCP** - Deployment management
- **Sentry MCP** - Error monitoring
- **Filesystem MCP** - Local file access

## Important Notes

### Data Persistence
- **CRITICAL:** Views and reactions are stored in Supabase PostgreSQL
- **First-time setup:** Must run SQL migration from `supabase/migrations/`
- **Migration location:** `supabase/migrations/20250119_create_views_and_reactions_tables.sql`
- **Migration guide:** See `supabase/migrations/README.md` for detailed instructions
- **Verification:** After migration, test API endpoints to ensure data persists

### Blog Posts
- **Meta object must be duplicated** - Define meta in both `content.mdx` AND `page.tsx` (TypeScript limitation prevents importing from MDX)
- **Date format**: Use "YYYY-MM-DD" format in meta.date field
- **Series metadata**: Optional but recommended for tutorial content
- **Embeddings must be regenerated** after blog content changes for AI chat to reflect updates: `npm run generate-embeddings`
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
- **CI/CD runs on push to main** - lint → test → build → e2e (all must pass)
- **E2E tests require secrets** - OPENAI_API_KEY, SUPABASE keys in GitHub Secrets

### Code Quality
- **TypeScript strict mode enabled** - all code must be type-safe
- **No console.log in production** - automatically removed by Next.js config
- **ESLint errors must be fixed** - especially unescaped entities (use `&apos;` for apostrophes in JSX)
- **Accessibility is enforced** - descriptive alt text required for all images

### API Keys & Security
- **API keys server-side only** - never expose in client code
- **Supabase service key** restricted to API routes only
- **Google AdSense Publisher ID**: ca-pub-4505962980988232
- **Rate limiting applied** to all public API endpoints (see `RATE_LIMITS` presets)

### Testing
- **Unit tests must pass** before commit (run `npm test`)
- **E2E tests run in CI** - ensure local tests pass before pushing
- **Playwright browsers** - Only Chromium and Mobile Safari configured
- **Test files location**: Unit in `src/__tests__/`, E2E in `e2e/`
- **Coverage reports** generated with `npm run test:coverage`

### Three.js & Performance
- **Three.js components** dynamically imported (no SSR)
- **Motion preferences respected** - animations disabled for `prefers-reduced-motion`
- **Low-end device detection** - lighter animations for mobile/slow CPUs
- **Web Vitals tracked** - monitor performance in development console
- **Long task monitoring** - warns when tasks exceed 50ms
