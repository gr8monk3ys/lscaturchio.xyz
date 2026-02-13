/**
 * Types for GitHub API responses
 */

export interface GitHubRepo {
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  fork: boolean;
}

export interface GitHubTopicsResponse {
  names: string[];
}

export interface PortfolioRepo {
  title: string;
  description: string;
  href: string;
  slug: string;
  stack: string[];
  stars: number;
  forks: number;
  lastUpdated: string;
  logo: string;
}
