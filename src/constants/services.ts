export interface ServiceContent {
  title: string
  subtitle: string
  tabs: {
    name: string
    content: string
  }[]
}

export const SERVICES: ServiceContent[] = [
  {
    title: 'AI agents and automation',
    subtitle: 'Agents built around your task, not a template',
    tabs: [
      {
        name: 'What I build',
        content: "I build agents that do a named job: read a pile of documents and answer from them with the source attached, or take a repetitive step out of a workflow. Each one is scoped to your task, not assembled from a template.",
      },
      {
        name: 'How it works',
        content: "We start with a conversation about what you're trying to accomplish. Then I prototype quickly, iterate based on your feedback, and deliver something production-ready. No 50-page proposals - just working software.",
      },
      {
        name: 'Use cases',
        content: "The work I have shipped is document question-answering over a client's own corpus, fine-tuned classification, and retrieval that cites its sources. If your repetitive task is not one of those, say so on the call and I will tell you whether it is a fit.",
      },
      {
        name: 'Getting started',
        content: "Book a free 30-minute call and tell me what you're working on. I'll give you honest feedback on whether AI is the right solution and what it would take to build. No sales pitch, just straight talk.",
      },
    ],
  },
  {
    title: 'RAG and search systems',
    subtitle: 'Search that answers from your own documents',
    tabs: [
      {
        name: 'What I build',
        content: 'Retrieval systems that let you ask questions of your own documents and knowledge bases. Every answer cites the passage it came from, so a wrong one is traceable rather than mysterious.',
      },
      {
        name: 'Tech stack',
        content: 'What I have run in production: Neon pgvector for retrieval, OpenAI for embeddings and generation, Vertex AI and BigQuery for inference at volume. If your stack is different I will learn it, but I will not pretend I have already shipped on it.',
      },
      {
        name: 'Common projects',
        // No count here on purpose. This is a plain constants file with no way
        // to read the essay directory, so any number written into it is a
        // number that cannot stay true. The claim works without one.
        content: 'Internal knowledge search, documentation search that answers in prose, and research corpora you need to ask questions of. The chat on this site is the public example: it answers from every essay I have published and shows you what it read.',
      },
      {
        name: 'What you get',
        content: 'Retrieval that answers from your own documents with the source attached. I do not publish client outcome percentages: I have not run the controlled comparison that would make such a number mean anything.',
      },
    ],
  },
  {
    title: 'Technical consulting',
    subtitle: 'Get unstuck on AI/ML projects with hands-on help',
    tabs: [
      {
        name: 'How I help',
        content: "Sometimes you don't need someone to build the whole thing - you just need expertise to unblock your team. I do code reviews, architecture sessions, pair programming, and strategic planning for AI projects.",
      },
      {
        name: 'Common asks',
        content: '"Our RAG system is returning garbage." "We need to add AI features but don\'t know where to start." "Our LLM costs are out of control." "Should we fine-tune or use prompting?" These are the questions the work usually starts from.',
      },
      {
        name: 'Engagement types',
        content: 'One-time deep dives, weekly office hours, or embedded support with your team. Flexible arrangements based on what you actually need. Remote-friendly, async-friendly.',
      },
      {
        name: 'Background',
        content: "Production retrieval and classification systems at Sizzle and for Upwork clients, a plant-microbe prediction model at JGI, and the search that runs this site. The work history on the experience page lists each with its numbers.",
      },
    ],
  },
]
