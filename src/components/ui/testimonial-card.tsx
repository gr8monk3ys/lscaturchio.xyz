'use client';

import { Testimonial } from '@/types/testimonial';
import { motion } from 'framer-motion';
import { Linkedin, Twitter, Quote } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface TestimonialCardProps {
  testimonial: Testimonial;
  index?: number;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function TestimonialCard({ testimonial, index = 0 }: TestimonialCardProps) {
  const { name, role, company, avatar, content, linkedinUrl, twitterUrl, date } = testimonial;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.6, -0.05, 0.01, 0.99],
      }}
      whileHover={{
        y: -4,
        transition: { duration: 0.2, ease: 'easeOut' },
      }}
      className="group relative h-full"
    >
      <div className="neu-card h-full p-6 flex flex-col transition-all duration-300 hover:shadow-lg">
        {/* Quote Icon */}
        <div className="absolute -top-3 -left-1 text-primary/20">
          <Quote className="h-12 w-12 rotate-180" strokeWidth={1} />
        </div>

        {/* Content */}
        <blockquote className="relative z-10 flex-1 mb-6">
          <p className="text-muted-foreground leading-relaxed italic">
            &ldquo;{content}&rdquo;
          </p>
        </blockquote>

        {/* Author Info */}
        <div className="flex items-center gap-4 pt-4 border-t border-border/50">
          {/* Avatar */}
          {avatar ? (
            <Image
              src={avatar}
              alt={`${name} avatar`}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-semibold text-sm">
                {getInitials(name)}
              </span>
            </div>
          )}

          {/* Name and Role */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground truncate">{name}</h4>
            <p className="text-sm text-muted-foreground truncate">
              {role} at {company}
            </p>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-2">
            {linkedinUrl && (
              <Link
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  'text-muted-foreground hover:text-primary hover:bg-primary/10'
                )}
                aria-label={`${name}'s LinkedIn profile`}
              >
                <Linkedin className="h-4 w-4" />
              </Link>
            )}
            {twitterUrl && (
              <Link
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  'text-muted-foreground hover:text-primary hover:bg-primary/10'
                )}
                aria-label={`${name}'s Twitter profile`}
              >
                <Twitter className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Date */}
        {date && (
          <p className="text-xs text-muted-foreground/60 mt-3">
            {new Date(date).toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            })}
          </p>
        )}
      </div>
    </motion.div>
  );
}
