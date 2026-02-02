export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar?: string;
  companyLogo?: string;
  content: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  date?: string;
  project?: string; // Related project slug
  featured?: boolean;
}
