declare module "*.mdx" {
  export const meta: {
    title: string;
    description: string;
    date: string;
    updated?: string;
    image: string;
    tags: string[];
    series?: string;
    seriesOrder?: number;
    [key: string]: unknown;
  };
}
