import { Hero } from "@/components/home/Hero";
import { NewHereSection } from "@/components/home/new-here-section";
import { RecentBlogs } from "@/components/home/recent-blogs";
import { RecentProjects } from "@/components/home/recent-projects";
import { WorkingOnSection } from "@/components/home/working-on-section";
import { ProofBar } from "@/components/home/proof-bar";
import { NewsletterForm } from "@/components/newsletter/newsletter-form";
import { Section } from "@/components/ui/Section";
import { WebsiteStructuredData, PersonStructuredData, FAQStructuredData, BreadcrumbStructuredData } from "@/components/ui/structured-data";
import { getAllBlogs } from "@/lib/getAllBlogs";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

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

      {/* Unified CTA Section */}
      <Section padding="large" size="wide" background="muted" topDivider>
        <div className="neu-card p-8 lg:p-12 rounded-3xl bg-gradient-to-br from-background via-background to-primary/5">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* Left: Contact CTA */}
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Let&apos;s Build Something <span className="text-primary">Together</span>
              </h2>
              <p className="text-muted-foreground mb-6">
                I&apos;m always interested in new projects and collaborations. Whether you need AI solutions,
                data analysis, or a web application, I&apos;d love to hear from you.
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <Link
                  href="/contact"
                  className="cta-primary px-7 py-3.5 rounded-2xl inline-flex items-center gap-2"
                >
                  <ArrowRight className="h-4 w-4" />
                  Start a Project
                </Link>
              </div>
            </div>

            {/* Right: Newsletter Form */}
            <div className="neu-pressed rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-2 text-center">Stay Updated</h3>
              <p className="text-sm text-muted-foreground mb-4 text-center">
                Get insights on AI, web development, and data science.
              </p>
              <NewsletterForm />
            </div>
          </div>
        </div>
      </Section>
    </main>
  );
}
