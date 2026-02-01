import { Container } from "@/components/Container";
import { Hero } from "@/components/home/Hero";
import { RecentBlogs } from "@/components/home/recent-blogs";
import { RecentProjects } from "@/components/home/recent-projects";
import { WorkingOnSection } from "@/components/home/working-on-section";
import { NewsletterForm } from "@/components/newsletter/newsletter-form";
import { WebsiteStructuredData, PersonStructuredData, FAQStructuredData, BreadcrumbStructuredData } from "@/components/ui/structured-data";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
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

      <Container size="large">
        <h1 className="sr-only">Lorenzo Scaturchio - Data Scientist and Developer Portfolio</h1>
        <Hero />

        <WorkingOnSection />

        <RecentBlogs />
        <RecentProjects />
      </Container>

      {/* Unified CTA Section */}
      <section className="w-full px-4 md:px-6 py-16 lg:py-24">
        <div className="max-w-5xl mx-auto">
          <div className="neu-card p-8 lg:p-12">
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
                    href="https://calendly.com/gr8monk3ys/30min"
                    className="neu-button bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-all inline-flex items-center gap-2"
                  >
                    <ArrowRight className="h-4 w-4" />
                    Schedule a Call
                  </Link>
                  <Link
                    href="/services"
                    className="neu-button px-6 py-3 rounded-xl font-medium text-foreground hover:text-primary transition-all"
                  >
                    View Services
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
        </div>
      </section>
    </main>
  );
}
