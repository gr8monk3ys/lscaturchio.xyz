import { Product } from "@/types/products";

import leetcodeSolver from "../../public/images/logos-modern/leetcode-solver.svg";
import findMyDoggo from "../../public/images/logos-modern/find-my-doggo.svg";
import tradingBot from "../../public/images/logos-modern/trading-bot.svg";
import eyebookReader from "../../public/images/logos-modern/eyebook-reader.svg";
import linkFlame from "../../public/images/logos-modern/linkflame.svg";
import TAlker from "../../public/images/logos-modern/talker.svg";
import blogAI from "../../public/images/logos-modern/blog-ai.svg";
import paperSummarizer from "../../public/images/logos-modern/paper-summarizer.svg";

export const products: Product[] = [
  // ============================================
  // FEATURED PROJECTS (4)
  // ============================================
  {
    href: "https://github.com/gr8monk3ys/TAlker",
    title: "Talker",
    description:
      "An open source teaching assistant RAG leveraging OLlama2 with a FAISS knowledge base. Increased student engagement by 30% and learning efficiency by 25%.",
    thumbnail: TAlker,
    images: [TAlker],
    stack: ["Python", "FAISS", "OLlama2", "RAG"],
    slug: "talker",
    // Enhanced fields
    featured: true,
    categories: ["ai-ml", "open-source"],
    status: "active",
    startDate: "2024-01",
    sourceUrl: "https://github.com/gr8monk3ys/TAlker",
    caseStudy: {
      challenge: "Students struggled to get timely answers to course-specific questions outside of office hours, leading to bottlenecks and disengagement.",
      solution: "Built a RAG-powered teaching assistant using OLlama2 and FAISS that answers questions based on class syllabus, slides, and materials. Added multi-modal support including YouTube videos with timestamp links.",
      results: [
        "30% increase in student engagement",
        "25% improvement in learning efficiency",
        "Multi-modal responses with video timestamps",
        "Open source with community contributions"
      ],
      metrics: [
        { label: "Engagement", value: "+30%" },
        { label: "Learning efficiency", value: "+25%" },
        { label: "Answer style", value: "Citations-first" },
        { label: "Modalities", value: "Text + video" },
      ],
      process: [
        {
          title: "Source corpus",
          description: "Collected course syllabus, slides, and materials; normalized formats for consistent chunking.",
        },
        {
          title: "Index + retrieval",
          description: "Chunked content into semantically coherent spans and indexed with FAISS for fast retrieval.",
        },
        {
          title: "Grounded generation",
          description: "Used retrieved context to generate answers with citations and optional video timestamps when available.",
        },
        {
          title: "Iteration",
          description: "Measured usage/feedback, tightened prompts/guardrails, and improved citations and fallback behavior.",
        },
      ],
      whatIdDoNext: [
        "Add an eval harness for retrieval quality (recall@k, faithfulness) and regression tests.",
        "Introduce caching + rate limiting for peak traffic periods and more robust context selection.",
        "Improve citation UX: quote snippets, highlight sources, and add per-source confidence.",
      ],
    },
    content: (
      <div>
        <p>
          Implemented and collaborated on an open source teaching assistant RAG
          leveraging OLlama2 with a FAISS knowledge base, answering students&apos;
          questions based on class criteria, syllabus, and slides, increasing
          student engagement by 30%.
        </p>
        <p>
          Included features of providing multi-modal results to queries from
          classrooms such as YouTube videos with video time queues based on
          question context, enhancing learning efficiency by 25%.
        </p>
      </div>
    ),
  },
  {
    href: "https://github.com/gr8monk3ys/trading-bot",
    title: "AI-Powered Trading Bot",
    description:
      "An advanced AI-driven stock trading bot leveraging FinBERT sentiment analysis, technical indicators, and sophisticated risk management for automated intelligent trading.",
    thumbnail: tradingBot,
    images: [tradingBot],
    stack: ["Python", "FinBERT", "Alpaca Trading API", "Pandas"],
    slug: "ai-powered-trading-bot",
    // Enhanced fields
    featured: true,
    categories: ["ai-ml", "data-science"],
    status: "maintained",
    startDate: "2023-08",
    sourceUrl: "https://github.com/gr8monk3ys/trading-bot",
    caseStudy: {
      challenge: "Manual trading requires constant market monitoring and is prone to emotional decision-making. Retail traders struggle to consistently apply risk management.",
      solution: "Engineered an AI-powered trading bot that combines FinBERT sentiment analysis on financial news with technical indicators (SMA, RSI). Implemented strict risk management with portfolio-wide and position limits.",
      results: [
        "Automated 24/7 market monitoring",
        "Sentiment analysis on real-time news",
        "Paper trading for safe strategy testing",
        "Integrated with Alpaca for live trading"
      ],
      metrics: [
        { label: "Monitoring", value: "24/7" },
        { label: "Signals", value: "Sentiment + TA" },
        { label: "Risk", value: "Portfolio-wide" },
        { label: "Modes", value: "Paper + live" },
      ],
      process: [
        {
          title: "Feature design",
          description: "Selected news + price features; engineered indicators and sentiment scoring for signal generation.",
        },
        {
          title: "Risk layer",
          description: "Implemented portfolio and position limits, exposure caps, and guardrails for drawdown control.",
        },
        {
          title: "Paper trading",
          description: "Validated strategies safely with paper trading to iterate on signal thresholds and sizing.",
        },
        {
          title: "Execution + monitoring",
          description: "Connected to Alpaca execution, added logging, and ensured predictable behavior under market noise.",
        },
      ],
      whatIdDoNext: [
        "Add a full backtest suite with walk-forward analysis and benchmark comparisons.",
        "Expand risk analytics: volatility targeting, exposure heatmaps, and post-trade attribution.",
        "Harden production ops: alerting, retries, and circuit breakers for API outages.",
      ],
    },
    content: (
      <div>
        <p>
          Engineered an AI-powered trading bot that automates stock trading by analyzing market sentiment using FinBERT and integrating key technical indicators such as SMA and RSI. The bot employs strict risk management strategies, including portfolio-wide and individual position risk limits.
        </p>
        <p>
          Integrated with the Alpaca Trading API, enabling real-time trading and paper trading for safe strategy testing before live deployment.
        </p>
      </div>
    ),
  },
  {
    href: "https://github.com/gr8monk3ys/leetcode-solver",
    title: "LeetCode Solver Bot",
    description:
      "An automated bot that solves LeetCode problems using GPT-4 and browser automation. Features intelligent solution generation and automatic code submission.",
    thumbnail: leetcodeSolver,
    images: [leetcodeSolver],
    stack: ["Python", "Playwright", "AgentQL", "GPT-4"],
    slug: "leetcode-solver-bot",
    // Enhanced fields
    featured: true,
    categories: ["ai-ml", "tools"],
    status: "active",
    startDate: "2024-03",
    sourceUrl: "https://github.com/gr8monk3ys/leetcode-solver",
    caseStudy: {
      challenge: "LeetCode practice is time-intensive. Exploring how AI can understand and solve coding problems demonstrates the capabilities and limitations of LLM reasoning.",
      solution: "Developed an automated bot integrating GPT-4 with Playwright browser automation. Features include automated login, random problem selection, intelligent solution generation, and automatic code submission.",
      results: [
        "Automated end-to-end problem solving",
        "Persistent login state management",
        "Detailed logging for monitoring",
        "Demonstrates AI reasoning capabilities"
      ],
      metrics: [
        { label: "Automation", value: "End-to-end" },
        { label: "Browser", value: "Playwright" },
        { label: "Selection", value: "Randomized" },
        { label: "Submission", value: "Automatic" },
      ],
      process: [
        {
          title: "Browser flow",
          description: "Automated login and navigation; kept session state stable across runs.",
        },
        {
          title: "Prompting",
          description: "Parsed constraints and examples; constructed prompts that preserve problem semantics.",
        },
        {
          title: "Generation + verification",
          description: "Generated solutions, performed quick sanity checks, and logged failures for iteration.",
        },
        {
          title: "Submission loop",
          description: "Submitted code automatically and stored artifacts (logs, outputs) for debugging.",
        },
      ],
      whatIdDoNext: [
        "Add unit test generation and a multi-pass 'revise' stage for hard problems.",
        "Cache problem parsing + embeddings to reduce redundant work and improve stability.",
        "Add safety controls to avoid accidental submissions or rate-limit issues.",
      ],
    },
    content: (
      <div>
        <p>
          Developed an automated bot that integrates GPT-4 with browser automation to solve LeetCode problems. The bot features automated login, random problem selection, intelligent solution generation, and automatic code submission, enhancing coding practice efficiency.
        </p>
        <p>
          Implemented persistent login state management and a detailed logging system to monitor activities and outcomes, ensuring reliability and ease of use.
        </p>
      </div>
    ),
  },
  {
    href: "https://github.com/gr8monk3ys/blog-AI",
    title: "Blog-AI",
    description:
      "An AI content generation tool using GPT-4 and LangChain to create SEO-optimized blog posts and structured books. Outputs clean MDX for blogs and DOCX for books.",
    thumbnail: blogAI,
    images: [blogAI],
    stack: ["Python", "OpenAI GPT-4", "LangChain", "MDX"],
    slug: "blog-ai",
    // Enhanced fields
    featured: true,
    categories: ["ai-ml", "tools"],
    status: "maintained",
    startDate: "2023-11",
    sourceUrl: "https://github.com/gr8monk3ys/blog-AI",
    caseStudy: {
      challenge: "Creating high-quality, SEO-optimized blog content is time-consuming. Writers need assistance generating structured content while maintaining their voice.",
      solution: "Constructed an automated blog content generation system using GPT-4 and LangChain. Implements workflows for generating SEO-optimized titles, descriptions, and detailed sections with context memory.",
      results: [
        "SEO-optimized content generation",
        "MDX output for static site blogs",
        "DOCX export for book formats",
        "Context-aware writing with memory"
      ],
      metrics: [
        { label: "Outputs", value: "MDX + DOCX" },
        { label: "Workflows", value: "SEO-aware" },
        { label: "Context", value: "Memory buffer" },
        { label: "Structure", value: "Sectioned" },
      ],
      process: [
        {
          title: "Brief → outline",
          description: "Turned topic + keywords into a stable outline with clear sections and intent.",
        },
        {
          title: "Workflow orchestration",
          description: "Used LangChain to chain steps and keep context consistent across generations.",
        },
        {
          title: "Draft + refine",
          description: "Generated drafts with iterative passes for clarity, tone, and SEO constraints.",
        },
        {
          title: "Export + publish",
          description: "Emitted clean MDX for static sites and DOCX for book-friendly formatting.",
        },
      ],
      whatIdDoNext: [
        "Add citations + fact checks for claims that require sources.",
        "Introduce a style guide layer to preserve voice and enforce editorial constraints.",
        "Add multilingual generation pipelines for international SEO and distribution.",
      ],
    },
    content: (
      <div>
        <p>
          Constructed an automated blog content generation system using OpenAI&apos;s
          GPT-4 model and LangChain.
        </p>
        <p>
          Accomplished workflows for generating SEO-optimized blog titles,
          descriptions, and detailed sections.
        </p>
        <p>
          Used Python and ConversationBufferMemory for maintaining context
          and orchestrating tasks.
        </p>
      </div>
    ),
  },
  // ============================================
  // ARCHIVED PROJECTS (4)
  // ============================================
  {
    href: "https://github.com/gr8monk3ys/find-my-doggo",
    title: "Find My Doggo",
    description:
      "A web application utilizing machine learning visual image recognition to help users find lost dogs by comparing photos to a database of dog images.",
    thumbnail: findMyDoggo,
    images: [findMyDoggo],
    stack: ["JavaScript", "Machine Learning", "Image Recognition"],
    slug: "find-my-doggo",
    // Enhanced fields
    featured: false,
    categories: ["ai-ml", "web-apps"],
    status: "archived",
    startDate: "2019-03",
    sourceUrl: "https://github.com/gr8monk3ys/find-my-doggo",
    content: (
      <div>
        <p>
          Collaborated on developing a web application for the 2019 Hack Merced event that assists users in finding lost dogs. The application allows users to upload a photo of a dog, which is then compared to a database using machine learning-based image recognition to identify potential matches.
        </p>
        <p>
          Used machine learning to improve the accuracy of image comparisons, providing a valuable tool for pet owners and shelters in reuniting lost dogs with their families.
        </p>
      </div>
    ),
  },
  {
    href: "https://github.com/gr8monk3ys/eyebook-pdf-reader",
    title: "Eyebook PDF Reader",
    description:
      "An application that enables users to control an e-book reader by tracking their eyes, allowing for hands-free navigation and enhanced accessibility.",
    thumbnail: eyebookReader,
    images: [eyebookReader],
    stack: ["JavaScript", "Eye Tracking", "Web Development"],
    slug: "eyebook-pdf-reader",
    // Enhanced fields
    featured: false,
    categories: ["tools", "web-apps"],
    status: "archived",
    startDate: "2018-09",
    sourceUrl: "https://github.com/gr8monk3ys/eyebook-pdf-reader",
    content: (
      <div>
        <p>
          Built an e-book reader application that uses eye-tracking technology to provide hands-free control. Features include automatic scrolling when the user&apos;s gaze reaches the bottom of the page and navigation to the main menu when focusing on a button for a specified duration.
        </p>
        <p>
          Implemented using JavaScript and web technologies, this application enhances accessibility and offers a novel reading experience by reducing the need for manual interactions.
        </p>
      </div>
    ),
  },
  {
    href: "https://github.com/gr8monk3ys/LinkFlame",
    title: "LinkFlame",
    description:
      "A powerful link management tool designed to simplify and enhance your digital marketing strategies.",
    thumbnail: linkFlame,
    images: [linkFlame],
    stack: ["React", "Node.js", "MongoDB"],
    slug: "linkflame",
    // Enhanced fields
    featured: false,
    categories: ["web-apps"],
    status: "archived",
    startDate: "2020-06",
    sourceUrl: "https://github.com/gr8monk3ys/LinkFlame",
    content: (
      <div>
        <p>
          LinkFlame is a link management tool for creating, managing, and tracking links. It provides detailed analytics and customizable link appearance.
        </p>
        <p>
          Built with React, Node.js, and MongoDB. Integrates with various marketing platforms.
        </p>
      </div>
    ),
  },
  {
    href: "https://github.com/gr8monk3ys/Paper-Summarizer",
    title: "Paper Summarizer",
    description:
      "A tool for summarizing academic papers using advanced NLP techniques.",
    thumbnail: paperSummarizer,
    images: [paperSummarizer],
    stack: ["Python", "NLP", "Transformers"],
    slug: "paper-summarizer",
    // Enhanced fields
    featured: false,
    categories: ["ai-ml", "tools"],
    status: "archived",
    startDate: "2021-02",
    sourceUrl: "https://github.com/gr8monk3ys/Paper-Summarizer",
    content: (
      <div>
        <p>
          A tool for summarizing academic papers using NLP techniques. Extracts key points and generates concise summaries from research documents.
        </p>
        <p>
          Built with transformers for accurate extraction. Accepts papers from various sources.
        </p>
      </div>
    ),
  },
];

// Get featured projects only
export function getFeaturedProjects(): Product[] {
  return products.filter((p) => p.featured === true);
}

// Get active (non-archived) projects
export function getActiveProjects(): Product[] {
  return products.filter((p) => p.status !== "archived");
}

// Get all unique technologies across all products
export function getAllTechnologies(): string[] {
  const techSet = new Set<string>();
  products.forEach((product) => {
    product.stack?.forEach((tech) => techSet.add(tech));
  });
  return Array.from(techSet).sort();
}

// Get projects by category
export function getProjectsByCategory(category: string): Product[] {
  return products.filter((p) => p.categories?.includes(category as never));
}
