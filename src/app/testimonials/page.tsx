import { Container } from '@/components/Container';
import { TestimonialsSection } from '@/components/home/testimonials-section';
import { BreadcrumbStructuredData } from '@/components/ui/structured-data';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Testimonials | Lorenzo Scaturchio',
  description:
    'Read what colleagues, clients, and collaborators say about working with Lorenzo Scaturchio on data science, machine learning, and web development projects.',
  openGraph: {
    title: 'Testimonials | Lorenzo Scaturchio',
    description:
      'Read what colleagues, clients, and collaborators say about working with Lorenzo Scaturchio on data science, machine learning, and web development projects.',
    type: 'website',
    url: 'https://lscaturchio.xyz/testimonials',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Testimonials | Lorenzo Scaturchio',
    description:
      'Read what colleagues, clients, and collaborators say about working with Lorenzo Scaturchio on data science, machine learning, and web development projects.',
  },
};

export default function TestimonialsPage() {
  return (
    <Container>
      <BreadcrumbStructuredData
        items={[
          { name: 'Home', item: 'https://lscaturchio.xyz' },
          { name: 'Testimonials', item: 'https://lscaturchio.xyz/testimonials' },
        ]}
      />

      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Testimonials
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          I have had the pleasure of working with amazing people throughout my career.
          Here is what some of them have to say about our collaboration.
        </p>
      </div>

      {/* All Testimonials */}
      <TestimonialsSection
        showAll={true}
        title="All Testimonials"
        description=""
      />

      {/* Call to Action */}
      <div className="mt-16 text-center">
        <div className="neu-card inline-block p-8 max-w-xl">
          <h2 className="text-2xl font-bold mb-4">
            Worked Together Before?
          </h2>
          <p className="text-muted-foreground mb-6">
            If we have collaborated on a project and you would like to share your
            experience, I would love to hear from you. Your feedback helps others
            understand what it is like to work with me.
          </p>
          <a
            href="mailto:lorenzo@lscaturchio.xyz?subject=Testimonial for Lorenzo"
            className="cta-primary px-6 py-3 rounded-xl inline-flex items-center gap-2"
          >
            Share Your Experience
          </a>
        </div>
      </div>
    </Container>
  );
}
