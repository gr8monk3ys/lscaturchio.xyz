export interface ServiceContent {
  title: string
  subtitle: string
  tabs: {
    name: string
    content: string
    features: string[]
  }[]
}

export const SERVICES: ServiceContent[] = [
  {
    title: 'AI Agents & Automation',
    subtitle: 'Custom AI agents that actually work for your specific use case',
    tabs: [
      {
        name: 'What I Build',
        content: "I build AI agents that handle real tasks - from research assistants that dig through documents to workflow automations that save hours of manual work. Each agent is designed around your actual needs, not generic templates.",
        features: [
          'LangChain & CrewAI implementations',
          'RAG systems with your data',
          'Tool-using agents',
          'Multi-agent workflows',
        ],
      },
      {
        name: 'How It Works',
        content: "We start with a conversation about what you're trying to accomplish. Then I prototype quickly, iterate based on your feedback, and deliver something production-ready. No 50-page proposals - just working software.",
        features: [
          'Rapid prototyping',
          'Weekly progress updates',
          'Your feedback shapes direction',
          'Production deployment support',
        ],
      },
      {
        name: 'Use Cases',
        content: "I've built agents for document analysis, customer support automation, research workflows, content generation, and data processing pipelines. If there's a repetitive task eating up your team's time, there's probably an agent for it.",
        features: [
          'Document Q&A systems',
          'Support ticket routing',
          'Research automation',
          'Content pipelines',
        ],
      },
      {
        name: 'Getting Started',
        content: "Book a free 30-minute call and tell me what you're working on. I'll give you honest feedback on whether AI is the right solution and what it would take to build. No sales pitch, just straight talk.",
        features: [
          'Free initial consultation',
          'Honest feasibility assessment',
          'Clear scope and timeline',
          'Transparent pricing',
        ],
      },
    ],
  },
  {
    title: 'RAG & Search Systems',
    subtitle: 'Make your data actually searchable and useful',
    tabs: [
      {
        name: 'What I Build',
        content: 'Retrieval-Augmented Generation systems that let you chat with your documents, search through knowledge bases, and get accurate answers grounded in your actual data. No hallucinations, just facts from your sources.',
        features: [
          'Vector database setup',
          'Embedding optimization',
          'Hybrid search strategies',
          'Citation & source tracking',
        ],
      },
      {
        name: 'Tech Stack',
        content: 'I work with Neon pgvector, Pinecone, Weaviate, and Chroma depending on your needs and scale. OpenAI, Anthropic, or open-source models for embeddings and generation. Whatever fits your requirements and budget.',
        features: [
          'Neon pgvector / Pinecone / Weaviate',
          'OpenAI / Claude / Open-source',
          'Next.js / Python backends',
          'Vercel / AWS deployment',
        ],
      },
      {
        name: 'Common Projects',
        content: 'Internal knowledge bases for teams, customer-facing documentation search, research paper analysis tools, legal document review systems, and support chatbots that actually know your product.',
        features: [
          'Internal knowledge search',
          'Documentation chatbots',
          'Research tools',
          'Support automation',
        ],
      },
      {
        name: 'Results',
        content: 'My clients typically see 60-80% reduction in time spent searching for information, higher accuracy than keyword search, and actually useful AI chat interfaces that people want to use.',
        features: [
          'Faster information retrieval',
          'Higher search accuracy',
          'Reduced support tickets',
          'Better user experience',
        ],
      },
    ],
  },
  {
    title: 'Technical Consulting',
    subtitle: 'Get unstuck on AI/ML projects with hands-on help',
    tabs: [
      {
        name: 'How I Help',
        content: "Sometimes you don't need someone to build the whole thing - you just need expertise to unblock your team. I do code reviews, architecture sessions, pair programming, and strategic planning for AI projects.",
        features: [
          'Architecture review',
          'Code review & optimization',
          'Team training sessions',
          'Technical strategy',
        ],
      },
      {
        name: 'Common Asks',
        content: '"Our RAG system is returning garbage" - "We need to add AI features but don\'t know where to start" - "Our LLM costs are out of control" - "Should we fine-tune or use prompting?" I\'ve helped teams work through all of these.',
        features: [
          'Debugging AI systems',
          'Cost optimization',
          'Model selection guidance',
          'Prompt engineering',
        ],
      },
      {
        name: 'Engagement Types',
        content: 'One-time deep dives, weekly office hours, or embedded support with your team. Flexible arrangements based on what you actually need. Remote-friendly, async-friendly.',
        features: [
          'One-time consultations',
          'Weekly advisory calls',
          'Embedded team support',
          'Async code review',
        ],
      },
      {
        name: 'Background',
        content: "I've been building with LLMs since GPT-3, worked on production RAG systems, and keep up with the latest research. Not a generalist who read a blog post - someone who's shipped real AI products.",
        features: [
          'Production experience',
          'Current research knowledge',
          'Practical implementation focus',
          'No-BS communication',
        ],
      },
    ],
  },
]
