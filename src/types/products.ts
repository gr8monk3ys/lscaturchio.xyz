import { StaticImageData } from "next/image";

export type ProjectStatus = 'active' | 'maintained' | 'archived';
export type ProjectCategory = 'ai-ml' | 'web-apps' | 'tools' | 'open-source' | 'data-science';

export interface CaseStudyMetric {
  label: string;
  value: string;
  note?: string;
}

export interface CaseStudyProcessStep {
  title: string;
  description: string;
}

export interface CaseStudy {
  challenge: string;
  solution: string;
  results: string[];
  metrics?: CaseStudyMetric[];
  process?: CaseStudyProcessStep[];
  whatIdDoNext?: string[];
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
