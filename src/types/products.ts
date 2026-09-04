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
  /** Always authored: every case study ships its own metrics. */
  metrics: CaseStudyMetric[];
  process?: CaseStudyProcessStep[];
  whatIdDoNext?: string[];
}

/**
 * How a project introduces itself on the home page. It lives on the project
 * record rather than in the home component so a project's facts and its
 * pitch are edited together — they had already drifted apart once.
 */
export interface ProjectHomeCard {
  kicker: string;
  title: string;
  blurb: string;
  /** Rendered as a single wall-label line, joined with separators. */
  metrics: string[];
  coverSrc: string;
}

export type Product = {
  title: string;
  description: string;
  thumbnail: StaticImageData;
  href: string;
  slug?: string;
  stack?: string[];
  details?: string[];
  // New fields for enhanced projects page
  categories?: ProjectCategory[];
  featured?: boolean;
  status?: ProjectStatus;
  demoUrl?: string;
  /** Only set when the repo is PUBLIC. A private repo's URL 404s for visitors. */
  sourceUrl?: string;
  /** Repo exists but is private — render an explanation, never a dead link. */
  sourcePrivate?: boolean;
  startDate?: string; // Format: "YYYY-MM"
  caseStudy?: CaseStudy;
  /** Set only on projects featured on the home page. */
  homeCard?: ProjectHomeCard;
};
