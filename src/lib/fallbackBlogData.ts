// Rule: TypeScript Usage - Use TypeScript for all code
// This file provides fallback data for blog operations when dynamic imports fail

export interface FallbackBlog {
  slug: string;
  title: string;
  description: string;
  date: string;
  image: string;
  tags: string[];
  content: string;
}

// Fallback blog data for search and API operations
export const fallbackBlogs: FallbackBlog[] = [
  {
    slug: "ai-ethics",
    title: "The Ethics of AI: Navigating the Future",
    description: "Exploring the ethical implications of artificial intelligence and how we can develop responsible AI systems.",
    date: "2023-05-15",
    image: "/images/blog/ai-ethics.jpg",
    tags: ["AI", "Ethics", "Technology"],
    content: "# The Ethics of AI: Navigating the Future\n\nArtificial Intelligence is reshaping our world. With great power comes great responsibility.\n\n## Key Ethical Considerations\n\n- Bias and fairness in AI systems\n- Privacy concerns and data protection\n- Accountability for AI decisions\n- Impact on employment and economic inequality"
  },
  {
    slug: "ai-puzzle",
    title: "A Reimaging of Artificial Intelligence",
    description: "A deep dive into the future of AI.",
    date: "2025-01-17",
    image: "/images/blog/ai-puzzle.jpg",
    tags: ["ai", "technology"],
    content: "# A Reimaging of Artificial Intelligence\n\nThe future of AI is both exciting and challenging.\n\n## Key Areas of Innovation\n\n- Multimodal AI systems\n- AI ethics and governance\n- Human-AI collaboration\n- AI and creativity"
  },
  {
    slug: "art-technology",
    title: "The Intersection of Art and Technology",
    description: "Investigating how technology is influencing and transforming the world of art.",
    date: "2025-02-26",
    image: "/images/blog/art-technology.jpg",
    tags: ["art", "technology", "creativity"],
    content: "# The Intersection of Art and Technology\n\nTechnology is opening new frontiers for artistic expression.\n\n## Digital Art Forms\n\n- Generative art and algorithms\n- Virtual and augmented reality experiences\n- NFTs and blockchain-based art\n- AI-assisted creation"
  },
  {
    slug: "fanged-noumena",
    title: "Fanged Noumena",
    description: "Exploring Nick Land's philosophical work and its implications for technology and consciousness.",
    date: "2025-01-15",
    image: "/images/blog/fanged-noumena.jpg",
    tags: ["philosophy", "technology", "consciousness"],
    content: "# Fanged Noumena\n\nNick Land's work represents a challenging perspective on philosophy and technology.\n\n## Key Concepts\n\n- Accelerationism and technological determinism\n- Critique of humanism\n- Capitalism as an inhuman force\n- The technological singularity"
  },
  {
    slug: "future-of-work",
    title: "The Future of Work in the Age of Automation",
    description: "Exploring how automation and artificial intelligence are transforming the job market and the skills needed for the future.",
    date: "2025-02-24",
    image: "/images/blog/future-of-work.jpg",
    tags: ["technology", "automation", "work", "future"],
    content: "# The Future of Work in the Age of Automation\n\nAI is transforming how we work, what jobs exist, and how careers develop.\n\n## Emerging Trends\n\n- Automation of routine tasks\n- Human-AI collaboration\n- New roles and skills\n- The gig economy and remote work"
  },
  {
    slug: "investing-in-monero",
    title: "Why Consider Investing in Monero (XMR)",
    description: "An exploration of Monero's unique features, its potential value proposition as a privacy-focused cryptocurrency investment, and the associated risks.",
    date: "2025-02-22",
    image: "/images/blog/investing-in-monero.jpg",
    tags: ["cryptocurrency", "investment", "privacy", "Monero", "XMR"],
    content: "# Why Consider Investing in Monero (XMR)\n\nMonero offers unique privacy features in the cryptocurrency landscape.\n\n## Key Features\n\n- Complete transaction privacy\n- Fungibility\n- Decentralized mining\n- Active development community"
  },
  {
    slug: "metaverse",
    title: "Exploring the Metaverse: Opportunities and Challenges",
    description: "Examining the potential of the metaverse, its challenges, and its impact on society.",
    date: "2025-02-25",
    image: "/images/blog/metaverse.jpg",
    tags: ["technology", "metaverse", "virtual reality", "augmented reality"],
    content: "# Exploring the Metaverse: Opportunities and Challenges\n\nThe metaverse represents a new frontier for digital interaction and economics.\n\n## Key Aspects\n\n- Virtual economies and digital ownership\n- Social interaction in virtual spaces\n- Privacy and security concerns\n- Hardware and accessibility challenges"
  },
  {
    slug: "simulation-hypothesis",
    title: "The Simulation Hypothesis",
    description: "Exploring the philosophical and scientific arguments for and against the idea that our reality is a computer simulation.",
    date: "2025-02-22",
    image: "/images/blog/simulation-hypothesis.jpg",
    tags: ["philosophy", "technology", "science"],
    content: "# The Simulation Hypothesis\n\nThe idea that our reality might be a sophisticated computer simulation has gained attention in recent years.\n\n## Key Arguments\n\n- Technological advancement and future computing power\n- Quantum mechanics and the nature of reality\n- Philosophical implications\n- Scientific tests and limitations"
  },
  {
    slug: "understanding-ego",
    title: "Understanding Ego",
    description: "A look at the concept of ego in relation to human behavior and its impact on our lives.",
    date: "2024-01-16",
    image: "/images/blog/understanding-ego.jpg",
    tags: ["psychology"],
    content: "# Understanding Ego\n\nThe ego plays a central role in human psychology and behavior.\n\n## Key Aspects\n\n- Ego formation and development\n- The ego in different psychological traditions\n- Ego and identity\n- Transcending ego-based thinking"
  }
];

// Helper function to get all blogs from fallback data
export function getFallbackBlogs(): FallbackBlog[] {
  return [...fallbackBlogs].sort((a, b) => b.date.localeCompare(a.date));
}

// Helper function to get a specific blog by slug
export function getFallbackBlogBySlug(slug: string): FallbackBlog | undefined {
  return fallbackBlogs.find(blog => blog.slug === slug);
}
