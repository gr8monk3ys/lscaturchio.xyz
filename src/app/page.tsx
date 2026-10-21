import { Hero } from "@/components/home/Hero";
import { NewHereSection } from "@/components/home/new-here-section";
import { ScrollCaseStudies } from "@/components/home/scroll-case-studies";
import { WhatIThink } from "@/components/home/what-i-think";
import { WhoIAm } from "@/components/home/who-i-am";
import { CurrentlyStrip } from "@/components/home/currently-strip";
import { FAQStructuredData, BreadcrumbStructuredData } from "@/components/ui/structured-data";
import { getAllBlogs } from "@/lib/getAllBlogs";
import { getGithubPortfolioRepos } from "@/lib/github-repos";
import { getPopularPosts } from "@/lib/popular-posts";
import type { Metadata } from "next";
import { ogCardUrl } from "@/lib/seo";
import { IDENTITY } from "@/constants/identity";
import { toBlogPreview } from "@/lib/blog-data";

export const metadata: Metadata = {
  title: { absolute: IDENTITY.titleDefault },
  description:
    "The AI and web tools Lorenzo Scaturchio builds, essays on technology, attention and work, films watched, books read, and what he is doing now.",
  openGraph: {
    title: IDENTITY.titleDefault,
    description:
      "The AI and web tools Lorenzo Scaturchio builds, his essays, and the rest of what he keeps.",
    images: [
      {
        url: ogCardUrl({
          title: "Lorenzo Scaturchio",
          description: IDENTITY.role,
          type: "default",
        }),
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: IDENTITY.titleDefault,
    description: "The AI and web tools Lorenzo Scaturchio builds, and his essays on technology, attention and work.",
    images: [
      ogCardUrl({
        title: "Lorenzo Scaturchio",
        description: IDENTITY.role,
        type: "default",
      }),
    ],
  },
};

export default async function Home() {
  // Fetch blog data, GitHub repos, and popular posts in parallel
  const [allBlogs, githubRepos, popularPostsResult] = await Promise.all([
    getAllBlogs(),
    getGithubPortfolioRepos(),
    getPopularPosts(3),
  ]);

  // Both writing sections come off the one published list the catalogue
  // returns, so the "latest" strip and the themed index cannot disagree.
  const publishedBlogs = allBlogs.map(toBlogPreview);
  const recentBlogs = publishedBlogs.slice(0, 3);

  const popularPosts = popularPostsResult.posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    views: p.views,
  }));

  const latestPost = recentBlogs[0]
    ? { slug: recentBlogs[0].slug, title: recentBlogs[0].title }
    : null;
  const latestRepo = githubRepos[0]
    ? { title: githubRepos[0].title, href: githubRepos[0].href }
    : null;

  return (
    <div className="relative isolate flex min-h-screen flex-col">
      <BreadcrumbStructuredData
        items={[
          {
            name: "Home",
            item: "https://lscaturchio.xyz"
          }
        ]}
      />
      <FAQStructuredData
        questions={[
          {
            question: "What services does Lorenzo Scaturchio offer?",
            answer: "AI engineering: retrieval and search systems with citations and evals, agent workflows and automation, and architecture reviews for LLM applications. Engagements start with a scoped first sprint."
          },
          {
            question: "How can I contact Lorenzo Scaturchio?",
            answer: "Use the contact form on the site, or schedule a call from the Work with me page."
          }
        ]}
      />

      {/* Hero: thesis + ask-my-site-anything */}
      <Hero />

      {/* Live "what I'm up to" strip — the garden's pulse */}
      <CurrentlyStrip latestPost={latestPost} latestRepo={latestRepo} />

      {/* What the work does for the people using it, before the essays */}
      <ScrollCaseStudies />

      {/* The writing, technology first; the full archive is one click away */}
      <WhatIThink posts={publishedBlogs} />

      {/* The person behind the rest of it */}
      <WhoIAm />

      {/* Wayfinding for first-time visitors */}
      <NewHereSection popularPosts={popularPosts} essayCount={publishedBlogs.length} />
    </div>
  );
}
