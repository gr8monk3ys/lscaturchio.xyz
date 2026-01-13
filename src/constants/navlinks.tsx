import {
  User,
  FileText,
  Briefcase,
  BookOpen,
  Lightbulb,
  Code2,
  FolderKanban,
  Layers,
  Tags,
  Clock,
  Link2,
  Wrench,
  Mail,
  Building2,
  Sparkles,
  Book,
  Film,
  Camera,
  Mic
} from 'lucide-react';

export interface NavItem {
  name: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
}

export interface NavCategory {
  name: string;
  icon?: React.ComponentType<{ className?: string }>;
  items: NavItem[];
}

// Categorized navigation with dropdowns
export const navigationCategories: NavCategory[] = [
  {
    name: 'About',
    icon: User,
    items: [
      { name: 'About Me', href: '/about', icon: User, description: 'Who I am' },
      { name: 'Now', href: '/now', icon: Clock, description: 'What I\'m up to' },
      { name: 'Uses', href: '/uses', icon: Wrench, description: 'My setup & tools' },
      { name: 'Books', href: '/books', icon: Book, description: 'What I\'m reading' },
      { name: 'Movies', href: '/movies', icon: Film, description: 'Films I\'ve watched' },
      { name: 'Photos', href: '/photos', icon: Camera, description: 'Photography' },
      { name: 'Links', href: '/links', icon: Link2, description: 'Bookmarks & resources' },
    ],
  },
  {
    name: 'Content',
    icon: FileText,
    items: [
      { name: 'Blog', href: '/blog', icon: BookOpen, description: 'Articles and thoughts' },
      { name: 'Podcast', href: '/podcast', icon: Mic, description: 'Audio episodes' },
      { name: 'TIL', href: '/til', icon: Lightbulb, description: 'Today I learned' },
      { name: 'Snippets', href: '/snippets', icon: Code2, description: 'Code snippets' },
      { name: 'Series', href: '/series', icon: Layers, description: 'Article series' },
      { name: 'Tags', href: '/tags', icon: Tags, description: 'Browse by topic' },
    ],
  },
  {
    name: 'Work',
    icon: Briefcase,
    items: [
      { name: 'Projects', href: '/projects', icon: FolderKanban, description: 'Things I built' },
      { name: 'Services', href: '/services', icon: Building2, description: 'What I offer' },
      { name: 'Professional', href: '/professional', icon: Sparkles, description: 'Work history' },
    ],
  },
];

// Contact link (always visible)
export const contactLink: NavItem = {
  name: 'Contact',
  href: '/contact',
  icon: Mail
};

// Flat navigation for backward compatibility and mobile
export const navigation = [
  { name: 'About', href: '/about' },
  { name: 'Blog', href: '/blog' },
  { name: 'TIL', href: '/til' },
  { name: 'Snippets', href: '/snippets' },
  { name: 'Projects', href: '/projects' },
];

// All pages for search/sitemap
export const allPages: NavItem[] = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Now', href: '/now' },
  { name: 'Uses', href: '/uses' },
  { name: 'Books', href: '/books' },
  { name: 'Movies', href: '/movies' },
  { name: 'Photos', href: '/photos' },
  { name: 'Links', href: '/links' },
  { name: 'Blog', href: '/blog' },
  { name: 'Podcast', href: '/podcast' },
  { name: 'TIL', href: '/til' },
  { name: 'Snippets', href: '/snippets' },
  { name: 'Series', href: '/series' },
  { name: 'Tags', href: '/tags' },
  { name: 'Projects', href: '/projects' },
  { name: 'Services', href: '/services' },
  { name: 'Professional', href: '/professional' },
  { name: 'Contact', href: '/contact' },
];
