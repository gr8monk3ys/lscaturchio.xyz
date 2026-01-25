import { StaticImageData } from "next/image";

export type ProjectStatus = 'active' | 'maintained' | 'archived';
export type ProjectCategory = 'ai-ml' | 'web-apps' | 'tools' | 'open-source' | 'data-science';

export interface CaseStudy {
  challenge: string;
  solution: string;
  results: string[];
}

export type Product = {
  title: string;
  description: string;
  thumbnail: StaticImageData;
  images: StaticImageData[] | string[];
  href: string;
  slug?: string;
  stack?: string[];
  content?: React.ReactNode | string;
  // New fields for enhanced projects page
  categories?: ProjectCategory[];
  featured?: boolean;
  status?: ProjectStatus;
  demoUrl?: string;
  sourceUrl?: string;
  startDate?: string; // Format: "YYYY-MM"
  caseStudy?: CaseStudy;
};
