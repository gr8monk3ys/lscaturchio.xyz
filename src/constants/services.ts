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
    subtitle: 'Agents built around your task, not a template',
    tabs: [
      {
        name: 'What I build',
        content: "I build agents that do a named job: read a pile of documents and answer from them with the source attached, or take a repetitive step out of a workflow. Each one is scoped to your task, not assembled from a template.",
        features: [
          'Retrieval over your own documents',
          'RAG systems with your data',
          'Tool-using agents',
          'Multi-agent workflows',
        ],
      },
      {
        name: 'How it works',
        content: "We start with a conversation about what you're trying to accomplish. Then I prototype quickly, iterate based on your feedback, and deliver something production-ready. No 50-page proposals - just working software.",
        features: [
          'Rapid prototyping',
          'Weekly progress updates',
          'Your feedback shapes direction',
          'Production deployment support',
        ],
      },
      {
        name: 'Use cases',
        content: "The work I have shipped is document question-answering over a client's own corpus, fine-tuned classification, and retrieval that cites its sources. If your repetitive task is not one of those, say so on the call and I will tell you whether it is a fit.",
        features: [
          'Document Q&A systems',
          'Fine-tuned classification',
          'Research automation',
          'Retrieval with citations',
        ],
      },
      {
        name: 'Getting started',
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
    subtitle: 'Search that answers from your own documents',
    tabs: [
      {
        name: 'What I build',
        content: 'Retrieval systems that let you ask questions of your own documents and knowledge bases. Every answer cites the passage it came from, so a wrong one is traceable rather than mysterious.',
        features: [
          'Vector database setup',
          'Embedding optimization',
          'Hybrid search strategies',
          'Citation & source tracking',
        ],
      },
      {
        name: 'Tech stack',
        content: 'What I have run in production: Neon pgvector for retrieval, OpenAI for embeddings and generation, Vertex AI and BigQuery for inference at volume. If your stack is different I will learn it, but I will not pretend I have already shipped on it.',
        features: [
          'Neon pgvector retrieval',
          'OpenAI / Claude / Open-source',
          'Next.js / Python backends',
          'Vercel / AWS deployment',
        ],
      },
      {
        name: 'Common projects',
        content: 'Internal knowledge search, documentation search that answers in prose, and research corpora you need to ask questions of. The chat on this site is the public example: it answers from eighty-three essays and shows you what it read.',
        features: [
          'Internal knowledge search',
          'Documentation chatbots',
          'Research tools',
          'Search that cites its source',
        ],
      },
      {
        name: 'What you get',
        content: 'Retrieval that answers from your own documents with the source attached. I do not publish client outcome percentages: I have not run the controlled comparison that would make such a number mean anything.',
        features: [
          'Answers with the source attached',
          'An eval set you can rerun',
          'A cost and latency budget, measured',
          'No outcome numbers I cannot show',
        ],
      },
    ],
  },
  {
    title: 'Technical Consulting',
    subtitle: 'Get unstuck on AI/ML projects with hands-on help',
    tabs: [
      {
        name: 'How I help',
        content: "Sometimes you don't need someone to build the whole thing - you just need expertise to unblock your team. I do code reviews, architecture sessions, pair programming, and strategic planning for AI projects.",
        features: [
          'Architecture review',
          'Code review & optimization',
          'Team training sessions',
          'Technical strategy',
        ],
      },
      {
        name: 'Common asks',
        content: '"Our RAG system is returning garbage." "We need to add AI features but don\'t know where to start." "Our LLM costs are out of control." "Should we fine-tune or use prompting?" These are the questions the work usually starts from.',
        features: [
          'Debugging AI systems',
          'Cost optimization',
          'Model selection guidance',
          'Prompt engineering',
        ],
      },
      {
        name: 'Engagement types',
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
        content: "Production retrieval and classification systems at Sizzle and for Upwork clients, a plant-microbe prediction model at JGI, and the search that runs this site. The work history on the experience page lists each with its numbers.",
        features: [
          'Production experience',
          'Current research knowledge',
          'Practical implementation focus',
          'Plain communication',
        ],
      },
    ],
  },
]
