export type Blog = {
  title: string;
  description: string;
  date: string;
  slug: string;
  image: string;
  tags?: string[];
  content?: string;
  // Allow additional properties with unknown type
  [key: string]: unknown;
};
