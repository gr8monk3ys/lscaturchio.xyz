import sidefolioAceternity from "../../public/images/sidefolio-aceternity.png";
import sidefolioAceternity2 from "../../public/images/sidefolio-aceternity-2.png";
import sidefolioAlgochurn from "../../public/images/sidefolio-algochurn.png";
import sidefolioAlgochurn2 from "../../public/images/sidefolio-algochurn.png";
import sidefolioMoonbeam from "../../public/images/sidefolio-moonbeam.png";
import sidefolioMoonbeam2 from "../../public/images/sidefolio-moonbeam-2.png";
import sidefolioTailwindMasterKit from "../../public/images/sidefolio-tailwindmasterkit.png";
import sidefolioTailwindMasterKit2 from "../../public/images/sidefolio-tailwindmasterkit-2.png";

export const products = [
  {
    href: "https://github.com/gr8monk3ys/TAlker",
    title: "Talker",
    description:
      "An open source teaching assistant RAG leveraging OLlama2 with a FAISS knowledge base.",
    thumbnail: sidefolioAceternity,
    images: [sidefolioAceternity, sidefolioAceternity2],
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
    href: "https://github.com/gr8monk3ys/BlogBot-AI",
    title: "BlogBot-AI",
    description:
      "An automated blog content generation system using OpenAI’s GPT-3.5-turbo model and Langchain.",
    thumbnail: sidefolioAlgochurn,
    images: [sidefolioAlgochurn, sidefolioAlgochurn2],
    stack: ["Python", "OpenAI GPT-3.5-turbo", "Langchain"],
    slug: "blogbot-ai",
    content: (
      <div>
        <p>
          Constructed an automated blog content generation system using OpenAI’s
          GPT-3.5-turbo model and Langchain.
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
    thumbnail: sidefolioMoonbeam,
    images: [sidefolioMoonbeam, sidefolioMoonbeam2],
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
    thumbnail: sidefolioTailwindMasterKit,
    images: [sidefolioTailwindMasterKit, sidefolioTailwindMasterKit2],
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
