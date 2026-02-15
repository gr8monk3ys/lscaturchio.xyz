/**
 * Single source of truth for tech stack names/versions used across the site.
 * Update here when upgrading frameworks — prevents version drift.
 */
export const SITE_TECH = {
  framework: 'Next.js 16',
  library: 'React 19',
  language: 'TypeScript',
  styling: 'Tailwind CSS',
  animations: 'Framer Motion',
  database: 'Neon PostgreSQL',
  ai: 'OpenAI GPT-4o',
  deployment: 'Vercel',
  router: 'App Router',
} as const
