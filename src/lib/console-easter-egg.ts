/**
 * Console Easter Egg - Logs fun ASCII art and messages to the browser console
 * for curious developers who open their dev tools.
 */

const ASCII_ART = `
%c
    __
   / /  ___  _ __ ___ _ __  _______
  / /  / _ \\| '__/ _ \\ '_ \\|_  / _ \\
 / /__| (_) | | |  __/ | | |/ / (_) |
 \\____/\\___/|_|  \\___|_| |_/___\\___/

  ____            _                  _     _
 / ___|  ___ __ _| |_ _   _ _ __ ___| |__ (_) ___
 \\___ \\ / __/ _\` | __| | | | '__/ __| '_ \\| |/ _ \\
  ___) | (_| (_| | |_| |_| | | | (__| | | | | (_) |
 |____/ \\___\\__,_|\\__|\\__,_|_|  \\___|_| |_|_|\\___/

`;

const WELCOME_MESSAGE = `
%c Hello there, curious developer! %c

I see you like to peek under the hood.

Here are some fun facts:
  - This site is built with Next.js 14 + TypeScript
  - AI chat uses RAG with OpenAI embeddings
  - Engagement data persists via Supabase

Want to see the source? Check out my GitHub!
Looking for what I use? Visit: lscaturchio.xyz/uses

Try the Konami Code for a surprise...
`;

const HIRE_MESSAGE = `
%c Open to new opportunities! %c

If you're interested in collaborating or have an exciting project,
feel free to reach out: lorenzo@lscaturchio.xyz

`;

/**
 * Logs the Easter egg messages to the console
 * Call this once when the app mounts
 */
export function logConsoleEasterEgg(): void {
  // Only run in browser environment
  if (typeof window === "undefined") return;

  // Only run in development or on production site (not during SSR)
  if (typeof console === "undefined") return;

  // Log ASCII art with styling
  console.log(
    ASCII_ART,
    "color: #2c5530; font-family: monospace; font-size: 10px; line-height: 1.2;"
  );

  // Log welcome message
  console.log(
    WELCOME_MESSAGE,
    "background: linear-gradient(90deg, #2c5530, #4a7c50); color: white; padding: 8px 16px; border-radius: 4px; font-weight: bold; font-size: 14px;",
    "color: #666; font-size: 12px; line-height: 1.6;"
  );

  // Log hiring message
  console.log(
    HIRE_MESSAGE,
    "background: #1a1a1a; color: #ffd700; padding: 8px 16px; border-radius: 4px; font-weight: bold; font-size: 14px;",
    "color: #888; font-size: 12px; line-height: 1.6;"
  );

  // Add a collapsible group with more info
  console.groupCollapsed("%c More Info", "color: #2c5530; font-weight: bold;");
  console.log("Tech Stack:", {
    framework: "Next.js 14 (App Router)",
    language: "TypeScript",
    styling: "Tailwind CSS",
    animations: "Framer Motion",
    database: "Supabase (PostgreSQL)",
    ai: "OpenAI GPT-4o + RAG",
    deployment: "Vercel",
  });
  console.log("Site Features:", [
    "MDX-based blog with syntax highlighting",
    "AI-powered chat with semantic search",
    "View counts and reactions",
    "Text-to-speech for blog posts",
    "Dark mode support",
    "PWA capabilities",
  ]);
  console.groupEnd();
}

/**
 * Logs a secret message when the Konami code is triggered
 */
export function logKonamiSecret(): void {
  if (typeof console === "undefined") return;

  console.log(
    "%c KONAMI CODE ACTIVATED! %c",
    "background: linear-gradient(90deg, #ff6b6b, #ffd93d, #6bcb77, #4d96ff, #9b59b6); color: white; padding: 12px 24px; border-radius: 4px; font-weight: bold; font-size: 16px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);",
    ""
  );

  console.log(
    "%c You found a secret! Achievement unlocked. %c",
    "color: #ffd700; font-size: 14px; font-weight: bold;",
    ""
  );
}
