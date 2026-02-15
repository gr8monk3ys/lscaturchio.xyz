import { Hero } from "@/components/home/Hero";
import { HomeAtmosphere } from "@/components/home/home-atmosphere";
import { NewHereSection } from "@/components/home/new-here-section";
import { HowIWorkSection } from "@/components/home/how-i-work-section";
import { RecentBlogs } from "@/components/home/recent-blogs";
import { RecentProjects } from "@/components/home/recent-projects";
import { WorkingOnSection } from "@/components/home/working-on-section";
import { ProofBar } from "@/components/home/proof-bar";
import { FAQStructuredData, BreadcrumbStructuredData } from "@/components/ui/structured-data";
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
    <main className="relative isolate flex min-h-screen flex-col">
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
      <NewHereSection />

      {/* How I Work */}
      <HowIWorkSection />

      {/* What I'm Working On */}
      <WorkingOnSection />

      {/* Recent Blog Posts */}
      <RecentBlogs blogs={recentBlogs} />

      {/* Recent GitHub Activity */}
      <RecentProjects />
    </main>
  );
}
