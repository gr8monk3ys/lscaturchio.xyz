export type ChangeType = "added" | "changed" | "fixed" | "highlight";

export interface ChangeItem {
  type: ChangeType;
  text: string;
}

export interface ChangelogEntry {
  version: string;
  date: string; // YYYY-MM-DD
  changes: ChangeItem[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "2.1.0",
    date: "2026-08-03",
    changes: [
      { type: "highlight", text: "Garden refresh: the site catches up with what actually got built" },
      { type: "added", text: "Eight new project case studies written from their repos (Cocoon, Verso, unlinkd, FraudStream, Feedless, Tidy Roll, pi-lab, qsensor-sim)" },
      { type: "added", text: "Movies and books rebuilt as annotated lists: profile favourites, own review text, full-marks books, custom shelves" },
      { type: "added", text: "Changelog now derives its shipped feed from merged pull requests" },
      { type: "changed", text: "/now reads current books, films, and posts from real logs so it cannot go stale" },
      { type: "changed", text: "/uses corrected against the actual dotfiles; /lab lists twelve experiments" },
      { type: "fixed", text: "CSV parsing no longer shreds reviews containing newlines; Letterboxd data joined on title+year across its two URI namespaces" },
      { type: "fixed", text: "Photos page no longer presents stock imagery as original work" },
    ],
  },
  {
    version: "2.0.0",
    date: "2025-01-18",
    changes: [
      { type: "highlight", text: "Major website redesign and feature expansion" },
      { type: "added", text: "Dark/light mode toggle with system preference detection" },
      { type: "added", text: "Newsletter subscription system with Neon PostgreSQL backend" },
      { type: "added", text: "Semantic search with CMD+K shortcut (OpenAI embeddings)" },
      { type: "added", text: "PWA support with offline functionality" },
      { type: "added", text: "Reading time estimation and scroll progress bar" },
      { type: "added", text: "AI-powered related posts recommendations" },
      { type: "added", text: "TIL (Today I Learned) digital garden section" },
      { type: "added", text: "Code snippets library with search and copy functionality" },
      { type: "added", text: "Giscus comments integration (GitHub Discussions)" },
      { type: "added", text: "Public analytics dashboard with real-time stats" },
      { type: "added", text: "GitHub contributions graph visualization" },
      { type: "added", text: "Public API with comprehensive documentation" },
      { type: "changed", text: "Optimized images to WebP format (89.9% size reduction)" },
      { type: "changed", text: "Improved navigation structure" },
      { type: "changed", text: "Enhanced mobile responsiveness" },
      { type: "fixed", text: "TypeScript strict mode compliance" },
      { type: "fixed", text: "Accessibility improvements" },
    ],
  },
  {
    version: "1.0.0",
    date: "2024-12-01",
    changes: [
      { type: "highlight", text: "Initial website launch" },
      { type: "added", text: "Blog system with MDX support" },
      { type: "added", text: "Portfolio projects showcase" },
      { type: "added", text: "AI chat powered by OpenAI GPT-4o" },
      { type: "added", text: "RSS feed generation" },
      { type: "added", text: "Automated sitemap generation" },
      { type: "added", text: "Vercel Analytics integration" },
    ],
  },
  {
    version: "0.1.0",
    date: "2024-11-01",
    changes: [
      { type: "added", text: "Project initialization" },
      { type: "added", text: "Basic Next.js setup" },
      { type: "added", text: "Design system foundation" },
    ],
  },
];

