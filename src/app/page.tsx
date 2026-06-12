import { Hero } from "@/components/home/Hero";
import { NewHereSection } from "@/components/home/new-here-section";
import { HowIWorkSection } from "@/components/home/how-i-work-section";
import { SelectedWriting } from "@/components/home/selected-writing";
import { ScrollCaseStudies } from "@/components/home/scroll-case-studies";
import { CurrentlyStrip } from "@/components/home/currently-strip";
import { FAQStructuredData, BreadcrumbStructuredData } from "@/components/ui/structured-data";
import { getAllBlogs } from "@/lib/getAllBlogs";
import { getGithubPortfolioRepos } from "@/lib/github-repos";
import { getPopularPosts } from "@/lib/popular-posts";
import type { Metadata } from "next";
import { ogCardUrl } from "@/lib/seo";
import { splitHomepageBlogs } from "@/lib/blog-data";

export const metadata: Metadata = {
  title: "Home",
  description:
    "AI case studies, product builds, and practical writing from Lorenzo Scaturchio across retrieval systems, automation, and web development.",
  openGraph: {
    title: "Lorenzo Scaturchio | Data Scientist, Developer & Digital Craftsman",
    description:
      "AI case studies, product builds, and practical writing across retrieval systems, automation, and web development.",
    images: [
      {
        url: ogCardUrl({
          title: "Lorenzo Scaturchio",
          description: "Data Scientist & Developer",
          type: "default",
        }),
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lorenzo Scaturchio | Data Scientist & Developer",
    description: "AI case studies, product builds, and practical writing across retrieval systems and web development.",
    images: [
      ogCardUrl({
        title: "Lorenzo Scaturchio",
        description: "Data Scientist & Developer",
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

  const { recentBlogs, selectedWriting } = splitHomepageBlogs(allBlogs);

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
            answer: "Lorenzo Scaturchio offers data science consulting, machine learning solutions, web application development, and custom digital experiences for businesses and individuals."
          },
          {
            question: "How can I contact Lorenzo Scaturchio?",
            answer: "You can reach out through the contact form on the website or schedule a meeting via the provided Calendly link."
          }
        ]}
      />

      <h1 className="sr-only">Lorenzo Scaturchio - Data Scientist and Developer Portfolio</h1>

      {/* Hero: thesis + ask-my-site-anything */}
      <Hero />

      {/* Live "what I'm up to" strip — the garden's pulse */}
      <CurrentlyStrip latestPost={latestPost} latestRepo={latestRepo} />

      {/* The one project moment: scroll-driven case studies */}
      <ScrollCaseStudies />

      {/* How I Work */}
      <HowIWorkSection />

      {/* The one writing moment */}
      <SelectedWriting posts={selectedWriting} />

      {/* Wayfinding for first-time visitors */}
      <NewHereSection popularPosts={popularPosts} />
    </div>
  );
}
