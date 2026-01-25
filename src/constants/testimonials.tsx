import { Testimonial } from '@/types/testimonial';

export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'Engineering Manager',
    company: 'DataFlow Inc.',
    content:
      'Lorenzo is an exceptional developer who brings both technical expertise and creative problem-solving to every project. His work on our RAG system significantly improved our search accuracy and user engagement.',
    linkedinUrl: 'https://linkedin.com',
    date: '2024-11',
  },
  {
    id: '2',
    name: 'Marcus Williams',
    role: 'CTO',
    company: 'AI Ventures',
    content:
      'Working with Lorenzo was a game-changer for our startup. He delivered a machine learning pipeline that exceeded our expectations and helped us secure our Series A funding.',
    twitterUrl: 'https://twitter.com',
    date: '2024-09',
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    role: 'Product Director',
    company: 'TechStart Labs',
    content:
      'Lorenzo has a rare combination of deep technical skills and the ability to communicate complex concepts clearly. His data visualizations transformed how our team understands user behavior.',
    linkedinUrl: 'https://linkedin.com',
    date: '2024-08',
  },
  {
    id: '4',
    name: 'James Park',
    role: 'Senior Data Scientist',
    company: 'Analytics Pro',
    content:
      'I had the pleasure of collaborating with Lorenzo on several open-source projects. His code is clean, well-documented, and he is always willing to help others learn and grow.',
    linkedinUrl: 'https://linkedin.com',
    twitterUrl: 'https://twitter.com',
    date: '2024-07',
  },
  {
    id: '5',
    name: 'Priya Sharma',
    role: 'VP of Engineering',
    company: 'ScaleUp Tech',
    content:
      'Lorenzo built our entire data infrastructure from the ground up. His expertise in both backend systems and data science made him invaluable to our team. Highly recommend working with him.',
    linkedinUrl: 'https://linkedin.com',
    date: '2024-05',
  },
  {
    id: '6',
    name: 'David Kim',
    role: 'Founder',
    company: 'NeuralPath AI',
    content:
      'As a startup founder, finding developers who can move fast without sacrificing quality is crucial. Lorenzo delivered our MVP ahead of schedule and the codebase is maintainable and scalable.',
    twitterUrl: 'https://twitter.com',
    date: '2024-03',
  },
];

// Featured testimonials for homepage display
export const featuredTestimonials = testimonials.slice(0, 3);
