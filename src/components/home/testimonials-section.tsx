'use client';

import { motion, useInView } from '@/lib/motion';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';
import { TestimonialCard } from '@/components/home/testimonial-card';
import { featuredTestimonials, testimonials } from '@/constants/testimonials';
import { Testimonial } from '@/types/testimonial';

interface TestimonialsSectionProps {
  showAll?: boolean;
  title?: string;
  description?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

export function TestimonialsSection({
  showAll = false,
  title = 'What People Say',
  description = 'Kind words from colleagues and clients I have worked with',
}: TestimonialsSectionProps) {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });

  const displayedTestimonials: Testimonial[] = showAll
    ? testimonials
    : featuredTestimonials;

  return (
    <section ref={containerRef} className="py-16">
      <div className="container px-4 md:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold">{title}</h2>
            {description && (
              <p className="text-muted-foreground mt-2">{description}</p>
            )}
          </div>
          {!showAll && (
            <Link
              href="/testimonials"
              className="group inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              View all testimonials
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          )}
        </div>

        {/* Testimonials Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'show' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {displayedTestimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              index={index}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
