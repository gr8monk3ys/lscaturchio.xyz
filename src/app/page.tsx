import { Hero } from "@/components/home/Hero";
import { HomeAtmosphere } from "@/components/home/home-atmosphere";
import { NewHereSection } from "@/components/home/new-here-section";
import { HowIWorkSection } from "@/components/home/how-i-work-section";
import { SelectedWriting } from "@/components/home/selected-writing";
import { RecentBlogs } from "@/components/home/recent-blogs";
import { RecentProjects } from "@/components/home/recent-projects";
import { ScrollCaseStudies } from "@/components/home/scroll-case-studies";
import { ProofBar } from "@/components/home/proof-bar";
import { FAQStructuredData, BreadcrumbStructuredData } from "@/components/ui/structured-data";
import { getAllBlogs } from "@/lib/getAllBlogs";
import { getGithubPortfolioRepos } from "@/lib/github-repos";
import { getPopularPosts } from "@/lib/popular-posts";
import type { Metadata } from "next";
import { ogCardUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Portfolio, writing, and experiments from Lorenzo Scaturchio across AI, machine learning, and web development.",
  openGraph: {
    title: "Lorenzo Scaturchio | Data Scientist, Developer & Digital Craftsman",
    description:
      "Portfolio, writing, and experiments across AI, machine learning, and web development.",
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
    description: "Portfolio, writing, and experiments across AI and web development.",
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

  const now = new Date();

  // Avoid showing future-dated posts on the homepage. We'll clean source dates separately,
  // but this keeps the landing experience and SEO sane.
  const sortedBlogs = allBlogs
    .map((blog) => ({ blog, time: new Date(blog.date).getTime() }))
    .filter(({ time }) => Number.isFinite(time))
    .filter(({ time }) => time <= now.getTime() + 1000 * 60 * 60 * 24)
    .sort((a, b) => b.time - a.time)
    .map(({ blog }) => blog);

  const recentBlogsRaw = sortedBlogs.slice(0, 3);
  const recentSlugs = new Set(recentBlogsRaw.map((blog) => blog.slug));

  const recentBlogs = recentBlogsRaw.map(({ title, description, date, slug, tags, image }) => ({
    title,
    description,
    date,
    slug,
    tags: tags || [],
    image: image || "/images/blog/default.webp",
  }));

  const selectedWriting = sortedBlogs
    .filter((blog) => !recentSlugs.has(blog.slug))
    .slice(0, 8)
    .map(({ title, description, date, slug, tags, image }) => ({
      title,
      description,
      date,
      slug,
      tags: tags || [],
      image: image || "/images/blog/default.webp",
    }));

  const popularPosts = popularPostsResult.posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    views: p.views,
  }));

  return (
    <div className="relative isolate flex min-h-screen flex-col">
      <HomeAtmosphere />
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

      {/* Hero Section */}
      <Hero />

      {/* Proof Bar */}
      <ProofBar />

      {/* New Here Section */}
      <NewHereSection popularPosts={popularPosts} />

      {/* How I Work */}
      <HowIWorkSection />

      {/* Scroll-driven case study reveals */}
      <ScrollCaseStudies />

      {/* Selected Writing */}
      <SelectedWriting posts={selectedWriting} />

      {/* Recent Blog Posts */}
      <RecentBlogs blogs={recentBlogs} />

      {/* Recent GitHub Activity */}
      <RecentProjects repos={githubRepos} />
    </div>
  );
}
