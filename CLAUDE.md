# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**lscaturchio.xyz** is a modern personal portfolio and blog website built with Next.js 14 App Router, showcasing work in data science, web development, and AI integration. The site features:
- MDX-based blog with syntax highlighting
- AI chat powered by OpenAI GPT-4o with RAG (retrieval-augmented generation)
- Server-side rendering with React Server Components
- Vector search using Supabase for semantic blog content retrieval
- Comprehensive SEO with structured data and automated sitemap/RSS generation

**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, Supabase, OpenAI API, Framer Motion

## Development Commands

```bash
# Development
npm run dev                    # Start dev server at localhost:3000
npm run lint                   # Run ESLint checks
npm run build                  # Production build (auto-generates sitemap)
npm run start                  # Run production server locally

# AI/Content
npm run generate-embeddings    # Generate OpenAI embeddings for blog content
npm run generate-sitemap       # Generate XML sitemap (auto-runs post-build)
```

**Environment Variables Required:**
- `OPENAI_API_KEY` - OpenAI API access for chat and embeddings
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase database URL
- `SUPABASE_SERVICE_KEY` - Server-side Supabase access
- `NEXT_PUBLIC_SITE_URL` - Custom site URL (optional)
- `ANALYTICS_API_KEY` - Analytics endpoint protection (optional)

See `.env.example` for details.

## Architecture Overview

### App Router Structure (Next.js 14)
- Server Components by default for performance
- Client Components (`"use client"`) only for interactivity
- Pages: `src/app/[route]/page.tsx`
- API Routes: `src/app/api/[route]/route.ts`
- Global layout: `src/app/layout.tsx` (fonts, metadata, analytics)

### Content Management (MDX)
**Blog Post Structure** - Each blog post requires two files:

1. **`src/app/blog/[slug]/content.mdx`** - The blog content with metadata export:
```mdx
export const meta = {
  title: "Blog Title",
  description: "Brief description",
  date: "2024-01-15",
  image: "/images/blog/image.webp",
  tags: ["tag1", "tag2"]
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
- `src/lib/embeddings.ts` - Embedding generation and search
- `src/lib/generateEmbeddings.ts` - CLI tool to pre-process blog content
- `src/app/api/chat/route.ts` - Chat endpoint (model: gpt-4o-2024-08-06, temp: 0.4, max_tokens: 1000)

**Supabase Schema:**
```sql
embeddings (
  id: text (primary key)
  content: text (blog chunk)
  embedding: vector(1536)
  metadata: jsonb (blog title, url, etc.)
)
```

### Middleware Patterns (`src/middleware.ts`)
Handles request/response optimization:
- **Cache Control by Content Type:**
  - Static assets (JS, CSS, images): 1 year cache
  - HTML pages: 5 min cache with `stale-while-revalidate`
  - API responses: no client cache
- **Security Headers:** XSS protection, clickjacking prevention, nosniff
- **www Redirect:** Normalizes `www.lscaturchio.xyz` → `lscaturchio.xyz`

### Component Architecture
```
src/components/
├── ui/              # Base UI components (navbar, footer, cards, etc.)
├── ads/             # Google AdSense integration components
├── blog/            # Blog-specific components (BlogLayout, Prose, etc.)
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
- **Text-to-Speech**: Browser-native speech synthesis (Play/Pause controls)
- **Share Button**: Uses Web Share API for native sharing
- **JSON-LD Structured Data**: Automatic BlogPosting schema generation
- **AdBanner Integration**: 4 ad units per post (top banner, 2 in-article ads, bottom banner)
- **Breadcrumb Navigation**: Auto-generated from URL path
- **FallbackImage**: Hero image with automatic fallback to default.webp
- **Back Button**: Router-based navigation with animation

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

### Services Page Architecture
The Services page (`src/app/services/page.tsx`) features an interactive component:

**ServicesSection** (`src/components/services/service-section.tsx`)
- **Three service offerings**: Autonomous Agent Development, Enterprise Consulting, Chatbot Development
- **Interactive tabs**: Each service has 4 tabs (Strategy, Performance, Use Cases, Feasibility)
- **State management**: Selected service and tab state with Framer Motion animations
- **Content structure**: Each tab has description text + feature badges
- **Hover effects**: Cards scale on hover, arrow icon rotates
- **Responsive grid**: 3 columns desktop, single column mobile

**FaqSection** (`src/components/services/faq-section.tsx`)
- Questions loaded from `src/constants/questions.tsx`
- Accordion-style collapsible answers
- Contact CTA at bottom with Calendly link

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
| `src/app/layout.tsx` | Root layout: fonts, analytics, AdSense, global Suspense boundaries |
| `src/lib/getAllBlogs.ts` | Scans blog directories, extracts MDX metadata (both `*.mdx` and `*/content.mdx`) |
| `src/lib/embeddings.ts` | OpenAI embedding generation and Supabase vector search |
| `src/app/api/chat/route.ts` | AI chat endpoint with RAG pattern (GPT-4o-2024-08-06) |
| `src/components/blog/BlogLayout.tsx` | Blog wrapper: text-to-speech, share, ads, structured data |
| `src/components/ui/fallback-image.tsx` | Image with automatic fallback to default.webp |
| `src/components/ads/AdBanner.tsx` | Google AdSense integration component |
| `src/middleware.ts` | Request handling, caching, security headers, www redirect |
| `next.config.mjs` | Next.js config: performance, MDX, images, webpack |
| `tailwind.config.ts` | Design system: colors, typography, dark mode |
| `src/constants/` | All app content data (projects, nav, pricing, etc.) |
| `src/app/metadata.ts` | Default site metadata (OG, Twitter, robots) |

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
     tags: ["tag1", "tag2"]
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

## MCP Configuration

Model Context Protocol servers configured in `.mcp.json`:
- **GitHub MCP** - Repository operations
- **Vercel MCP** - Deployment management
- **Sentry MCP** - Error monitoring
- **Filesystem MCP** - Local file access

## Important Notes

### Blog Posts
- **Meta object must be duplicated** - Define meta in both `content.mdx` AND `page.tsx` (TypeScript limitation prevents importing from MDX)
- **Date format**: Use "YYYY-MM-DD" format in meta.date field
- **Embeddings must be regenerated** after blog content changes for AI chat to reflect updates: `npm run generate-embeddings`
- **All blog posts get 4 ads** automatically via BlogLayout (top, 2 in-article, bottom)
- **Text-to-speech is built-in** - BlogLayout provides Play/Pause controls

### Images
- **WebP format required** for all images (use `cwebp -q 85` for optimization)
- **Recent optimization** reduced total image size by 89.9% (23.7MB → 2.4MB)
- **Use FallbackImage component** for blog hero images (auto-falls back to default.webp)
- **Blog image path**: `/images/blog/[name].webp`

### Build & Deploy
- **Sitemap auto-generates on build** via postbuild hook
- **14 blog posts** currently live (as of Jan 2025)
- **Middleware caching is aggressive** - test in production-like environment
- **Git hooks via Husky** - Pre-commit linting (configured in `.husky/`)

### Code Quality
- **TypeScript strict mode enabled** - all code must be type-safe
- **No console.log in production** - automatically removed by Next.js config
- **ESLint errors must be fixed** - especially unescaped entities (use `&apos;` for apostrophes in JSX)
- **Accessibility is enforced** - descriptive alt text required for all images

### API Keys & Security
- **API keys server-side only** - never expose in client code
- **Supabase service key** restricted to API routes only
- **Google AdSense Publisher ID**: ca-pub-4505962980988232
