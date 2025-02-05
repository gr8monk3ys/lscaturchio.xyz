
import leetcodeSolver from "../../public/images/logos/leetcode-solver.webp";
import findMyDoggo from "../../public/images/logos/find-my-doggo.webp";
import tradingBot from "../../public/images/logos/trading-bot.webp";
import eyebookReader from "../../public/images/logos/eyebook-reader.webp";
import linkFlame from "../../public/images/logos/linkflame.webp";
import TAlker from "../../public/images/logos/talker.webp";
import blogAI from "../../public/images/logos/blog-ai.webp";
import paperSummarizer from "../../public/images/logos/paper-summarizer.webp";

export const products = [
  {
    href: "https://github.com/gr8monk3ys/leetcode-solver",
    title: "LeetCode Solver Bot",
    description:
      "An automated bot that solves LeetCode problems using GPT-4 and browser automation. Built with Python, Playwright, and AgentQL.",
    thumbnail: leetcodeSolver,
    images: [leetcodeSolver],
    stack: ["Python", "Playwright", "AgentQL", "GPT-4"],
    slug: "leetcode-solver-bot",
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
    href: "https://github.com/gr8monk3ys/trading-bot",
    title: "AI-Powered Trading Bot",
    description:
      "An advanced AI-driven stock trading bot leveraging sentiment analysis, technical indicators, and sophisticated risk management to automate intelligent trading strategies.",
    thumbnail: tradingBot,
    images: [tradingBot],
    stack: ["Python", "FinBERT", "Alpaca Trading API"],
    slug: "ai-powered-trading-bot",
    content: (
      <div>
        <p>
          Engineered an AI-powered trading bot that automates stock trading by analyzing market sentiment using FinBERT and integrating key technical indicators such as SMA and RSI. The bot employs comprehensive risk management strategies, including portfolio-wide and individual position risk limits.
        </p>
        <p>
          Achieved seamless integration with the Alpaca Trading API, enabling real-time trading and paper trading for safe strategy testing before live deployment.
        </p>
      </div>
    ),
  },
  {
    href: "https://github.com/gr8monk3ys/find-my-doggo",
    title: "Find My Doggo",
    description:
      "A web application utilizing machine learning visual image recognition to help users find lost dogs by comparing photos to a database of dog images.",
    thumbnail: findMyDoggo,
    images: [findMyDoggo],
    stack: ["JavaScript", "Machine Learning", "Image Recognition"],
    slug: "find-my-doggo",
    content: (
      <div>
        <p>
          Collaborated on developing a web application for the 2019 Hack Merced event that assists users in finding lost dogs. The application allows users to upload a photo of a dog, which is then compared to a database using machine learning-based image recognition to identify potential matches.
        </p>
        <p>
          Leveraged machine learning techniques to enhance the accuracy of image comparisons, providing a valuable tool for pet owners and shelters in reuniting lost dogs with their families.
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
    content: (
      <div>
        <p>
          Developed an innovative e-book reader application that utilizes eye-tracking technology to provide hands-free control. Features include automatic scrolling when the user&apos;s gaze reaches the bottom of the page and navigation to the main menu when focusing on a button for a specified duration.
        </p>
        <p>
          Implemented using JavaScript and web technologies, this application enhances accessibility and offers a novel reading experience by reducing the need for manual interactions.
        </p>
      </div>
    ),
  },
  {
    href: "https://github.com/gr8monk3ys/TAlker",
    title: "Talker",
    description:
      "An open source teaching assistant RAG leveraging OLlama2 with a FAISS knowledge base.",
    thumbnail: TAlker,
    images: [TAlker],
    stack: ["Python", "FAISS", "OLlama2"],
    slug: "talker",
    content: (
      <div>
        <p>
          Implemented and collaborated on an open source teaching assistant RAG
          leveraging OLlama2 with a FAISS knowledge base, answering students’
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
    href: "https://github.com/gr8monk3ys/blog-AI",
    title: "Blog-AI",
    description:
      "A powerful AI content generation tool that leverages GPT-4 and LangChain to automatically create SEO-optimized blog posts and structured books. Generate professional-quality content with clean output in MDX format for blogs and DOCX for books, perfect for content creators and writers looking to streamline their workflow.",
    thumbnail: blogAI,
    images: [blogAI],
    stack: ["Python", "OpenAI GPT-4", "Langchain"],
    slug: "blog-ai",
    content: (
      <div>
        <p>
          Constructed an automated blog content generation system using OpenAI’s
          GPT-4 model and Langchain.
        </p>
        <p>
          Accomplished workflows for generating SEO-optimized blog titles,
          descriptions, and detailed sections.
        </p>
        <p>
          Utilized Python and ConversationBufferMemory for maintaining context
          and orchestrating tasks.
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
    content: (
      <div>
        <p>
          LinkFlame is a comprehensive link management tool developed to
          streamline and optimize your digital marketing efforts. It provides
          functionalities for creating, managing, and tracking links to ensure
          maximum engagement and performance.
        </p>
        <p>
          Leveraging modern technologies like React for the frontend, Node.js
          for the backend, and MongoDB for the database, LinkFlame offers a
          robust and scalable solution for marketers and businesses looking to
          enhance their online presence.
        </p>
        <p>
          Key features include detailed analytics, customizable link appearance,
          and seamless integration with various marketing platforms, making it
          an indispensable tool for any digital marketing strategy.
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
    content: (
      <div>
        <p>
          Developed a robust tool for summarizing academic papers using advanced
          NLP techniques, facilitating quick comprehension of complex research
          documents.
        </p>
        <p>
          Leveraged state-of-the-art transformers to extract key points and
          generate concise summaries, enhancing the efficiency of academic
          research.
        </p>
        <p>
          Integrated with various data sources to allow seamless input of
          research papers and articles, providing a versatile solution for
          researchers and students alike.
        </p>
      </div>
    ),
  },
];
