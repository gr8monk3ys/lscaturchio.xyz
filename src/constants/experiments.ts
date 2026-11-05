export interface Experiment {
  title: string;
  href: string;
  /** Short kicker shown as a wall label above the title. */
  tag: string;
  description: string;
}

/**
 * Side projects that are real and running but too small or too strange for a
 * case study on /projects. The point of the list is the range, so keep it
 * genuinely varied rather than filling it out with more web apps.
 */
export const EXPERIMENTS: Experiment[] = [
  {
    title: "Grasping Straws",
    href: "https://github.com/gr8monk3ys/grasping-straws",
    tag: "Creative block",
    description:
      "A deck of lateral-thinking prompts in the spirit of Brian Eno and Peter Schmidt's Oblique Strategies, with entirely original card text. Tap, get a card, tap again. Static Astro, and the built output ships zero framework JavaScript.",
  },
  {
    title: "Patina & Chime",
    href: "https://github.com/gr8monk3ys/patina-and-chime",
    tag: "Minecraft",
    description:
      "A vanilla+ Fabric mod for Minecraft 26.2. Copper ages, and each age has its own job: a hopper changes what it does as it oxidizes, and wax locks the one you want. Amethyst hears, so a jukebox nearby grows crystals faster and one note block harvests them.",
  },
  {
    title: "Numen",
    href: "https://github.com/gr8monk3ys/numerology",
    tag: "Esoterica",
    description:
      "Numerology read across both the Pythagorean and Chaldean systems, with tarot birth cards and astrological correspondences, styled as a dark grimoire. Nonsense taken seriously enough to implement correctly.",
  },
  {
    title: "Movie Conceptualizer",
    href: "https://github.com/gr8monk3ys/movie-conceptualizer",
    tag: "Film",
    description:
      "Fountain screenplay in, shot list and storyboard out, via a set of agents that each handle one stage of pre-production rather than one model doing all of it badly.",
  },
  {
    title: "Album Conceptualizer",
    href: "https://github.com/gr8monk3ys/album-conceptualizer",
    tag: "Music",
    description:
      "A workspace for building coherent concept albums — structure, theory, and export handoff. Deliberately not a one-prompt song generator; it is strongest at the album-level coherence that those tools ignore.",
  },
  {
    title: "Free VST Plugins",
    href: "https://github.com/gr8monk3ys/VSTs",
    tag: "Music",
    description:
      "A manifest of free audio plugins, each pinned to a download URL and a SHA-256 hash, and a downloader that refuses any file that no longer matches. The existing lists are affiliate-farmed and half the links are dead; these at least know when something changed.",
  },
  {
    title: "HuggingFace portfolio",
    href: "https://huggingface.co/gr8monk3ys",
    tag: "ML",
    description:
      "Sixteen published projects on the Hub — datasets, fine-tuned models, and interactive Gradio Spaces across NLP, vision, and generative work.",
  },
  {
    title: "SpotifyForge",
    href: "https://github.com/gr8monk3ys/spotify",
    tag: "Music",
    description:
      "A CLI and MCP server that turn a library of liked songs into genre playlists sequenced to flow. It also keeps its own listening log, because Spotify only remembers your last fifty plays, and the tests run against an in-memory Spotify rather than mocks.",
  },
  {
    title: "discogs",
    href: "https://github.com/gr8monk3ys/discogs",
    tag: "Records",
    description:
      "A Python library and CLI for the Discogs API that syncs a collection and wantlist into a local cache — the groundwork for recommendations that know what is already on the shelf.",
  },
  {
    title: "75 Create",
    href: "https://github.com/gr8monk3ys/75create",
    tag: "Discipline",
    description:
      "The 75 Hard format bent toward creative work: five daily tasks, seventy-five days, and a log of the output at the end. Runs entirely in the browser with no backend and no account.",
  },
  {
    title: "bounty-scout",
    href: "https://github.com/gr8monk3ys/bounty-scout",
    tag: "Open source",
    description:
      "Ranks open-source bounties by expected dollars per hour, and by whether finishing one is a hiring signal. Read-only by design: it finds the work and never touches it.",
  },
  {
    title: "ui",
    href: "https://ui.lscaturchio.xyz",
    tag: "Design",
    description:
      "A shadcn registry holding the theme and components my apps share, installed straight from the shadcn CLI, so a fix to a button lands everywhere instead of being copied around.",
  },
  {
    title: "skills",
    href: "https://github.com/gr8monk3ys/skills",
    tag: "Agents",
    description:
      "A Claude Code plugin for Next.js, React and Supabase work: slash commands, skills, agents and hooks, packaged so the conventions travel between repositories.",
  },
  {
    title: "Moneta",
    href: "https://github.com/gr8monk3ys/moneta",
    tag: "Education",
    description:
      "An iOS and Android app that teaches personal finance in five-minute lessons.",
  },
  {
    title: "resume-AI",
    href: "https://github.com/gr8monk3ys/resume-AI",
    tag: "Careers",
    description:
      "A job-search toolkit whose ATS score is deterministic, so the same resume gets the same number twice. Tailoring and cover letters on top, across five model providers.",
  },
];
