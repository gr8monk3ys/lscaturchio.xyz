import { Hero } from "@/components/home/Hero";
import { NewHereSection } from "@/components/home/new-here-section";
import { RecentBlogs } from "@/components/home/recent-blogs";
import { RecentProjects } from "@/components/home/recent-projects";
import { WorkingOnSection } from "@/components/home/working-on-section";
import { ProofBar } from "@/components/home/proof-bar";
import { WebsiteStructuredData, PersonStructuredData, FAQStructuredData, BreadcrumbStructuredData } from "@/components/ui/structured-data";
import { getAllBlogs } from "@/lib/getAllBlogs";

export default async function Home() {
  const allBlogs = await getAllBlogs();
  const recentBlogs = allBlogs
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)
    .map(({ title, description, date, slug, tags, image }) => ({
      title,
      description,
      date,
      slug,
      tags: tags || [],
      image: image || '/images/blog/default.webp',
    }));
  return (
    <main className="flex min-h-screen flex-col">
      <WebsiteStructuredData
        url="https://lscaturchio.xyz"
        name="Lorenzo Scaturchio | Data Scientist & Developer"
        description="Lorenzo Scaturchio's personal site - building RAG systems, contributing to open source, and exploring the intersection of AI and user-friendly applications. Based in Southern California."
        siteType="Portfolio"
      />
      <PersonStructuredData
        name="Lorenzo Scaturchio"
        description="Data Scientist and Developer specializing in machine learning, data analysis, and web development"
        image="https://lscaturchio.xyz/images/portrait.webp"
        jobTitle="Data Scientist & Developer"
        url="https://lscaturchio.xyz"
        sameAs={[
          "https://github.com/lscaturchio",
          "https://linkedin.com/in/lscaturchio",
          "https://twitter.com/lscaturchio"
        ]}
      />
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
      <NewHereSection />

      {/* What I'm Working On */}
      <WorkingOnSection />

      {/* Recent Blog Posts */}
      <RecentBlogs blogs={recentBlogs} />

      {/* Recent GitHub Activity */}
      <RecentProjects />
    </main>
  );
}
