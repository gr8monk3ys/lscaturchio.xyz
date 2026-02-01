import {
  User,
  FileText,
  Briefcase,
  BookOpen,
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
  Mic,
  Compass,
  MessageSquare,
  Bookmark,
  Heart
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

// Start Here link (prominent, always visible)
export const startHereLink: NavItem = {
  name: 'Start Here',
  href: '/start-here',
  icon: Compass,
  description: 'New? Begin your journey here'
};

// Categorized navigation with dropdowns - reorganized into 4 cleaner categories
export const navigationCategories: NavCategory[] = [
  {
    name: 'About',
    icon: User,
    items: [
      { name: 'Start Here', href: '/start-here', icon: Compass, description: 'New? Begin here' },
      { name: 'About Me', href: '/about', icon: User, description: 'Who I am' },
      { name: 'Now', href: '/now', icon: Clock, description: 'What I\'m up to' },
      { name: 'Professional', href: '/professional', icon: Sparkles, description: 'Work history' },
    ],
  },
  {
    name: 'Work',
    icon: Briefcase,
    items: [
      { name: 'Projects', href: '/projects', icon: FolderKanban, description: 'Things I built' },
      { name: 'Services', href: '/services', icon: Building2, description: 'What I offer' },
      { name: 'Testimonials', href: '/testimonials', icon: MessageSquare, description: 'Client feedback' },
    ],
  },
  {
    name: 'Content',
    icon: FileText,
    items: [
      { name: 'Blog', href: '/blog', icon: BookOpen, description: 'Articles and thoughts' },
      { name: 'Series', href: '/series', icon: Layers, description: 'Article series' },
      { name: 'Podcast', href: '/podcast', icon: Mic, description: 'Audio episodes' },
      { name: 'Bookmarks', href: '/bookmarks', icon: Bookmark, description: 'Curated resources' },
      { name: 'Tags', href: '/tags', icon: Tags, description: 'Browse by topic' },
    ],
  },
  {
    name: 'Personal',
    icon: Heart,
    items: [
      { name: 'Books', href: '/books', icon: Book, description: 'What I\'m reading' },
      { name: 'Movies', href: '/movies', icon: Film, description: 'Films I\'ve watched' },
      { name: 'Uses', href: '/uses', icon: Wrench, description: 'My setup & tools' },
      { name: 'Photos', href: '/photos', icon: Camera, description: 'Photography' },
      { name: 'Links', href: '/links', icon: Link2, description: 'External links' },
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
  { name: 'Start Here', href: '/start-here' },
  { name: 'About', href: '/about' },
  { name: 'Blog', href: '/blog' },
  { name: 'Projects', href: '/projects' },
  { name: 'Services', href: '/services' },
];

// All pages for search/sitemap
export const allPages: NavItem[] = [
  { name: 'Home', href: '/' },
  { name: 'Start Here', href: '/start-here' },
  { name: 'About', href: '/about' },
  { name: 'Now', href: '/now' },
  { name: 'Professional', href: '/professional' },
  { name: 'Projects', href: '/projects' },
  { name: 'Services', href: '/services' },
  { name: 'Testimonials', href: '/testimonials' },
  { name: 'Blog', href: '/blog' },
  { name: 'Series', href: '/series' },
  { name: 'Podcast', href: '/podcast' },
  { name: 'Bookmarks', href: '/bookmarks' },
  { name: 'Tags', href: '/tags' },
  { name: 'Books', href: '/books' },
  { name: 'Movies', href: '/movies' },
  { name: 'Uses', href: '/uses' },
  { name: 'Photos', href: '/photos' },
  { name: 'Links', href: '/links' },
  { name: 'Contact', href: '/contact' },
];
