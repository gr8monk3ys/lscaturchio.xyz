export interface LinkData {
  title: string;
  link: string;
  linkDescription: string;
  rss?: string;
}

export interface SectionData {
  title: string;
  description: string;
  links: LinkData[];
}

export type LinksContent = Record<string, SectionData>;
