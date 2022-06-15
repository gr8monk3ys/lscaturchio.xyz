import { Testimonial } from '@/types/testimonial';

// Real testimonials only. The previous entries here were placeholder/fabricated
// names ("Sarah Chen", "Marcus Williams", …) with links pointing at bare
// linkedin.com / twitter.com — an instant credibility hit next to the paid
// consulting offer on /work-with-me. They have been removed.
//
// To re-enable the testimonials section, add real entries below (with genuine
// profile URLs). When this array is empty, `TestimonialsSection` renders nothing,
// so the homepage and /work-with-me simply omit the section until you have them.
export const testimonials: Testimonial[] = [];

// Featured testimonials for homepage display
export const featuredTestimonials = testimonials.slice(0, 3);
