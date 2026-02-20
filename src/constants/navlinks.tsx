import {
  User,
  FileText,
  Briefcase,
  BookOpen,
  FolderKanban,
  Layers,
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
  MessageSquare,
  Heart,
  TrendingUp
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

// Categorized navigation with dropdowns - reorganized into 4 cleaner categories
export const navigationCategories: NavCategory[] = [
  {
    name: 'About',
    icon: User,
    items: [
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
      { name: 'Work With Me', href: '/work-with-me', icon: Sparkles, description: 'Hire me for AI/RAG work' },
      { name: 'Services', href: '/work-with-me#services', icon: Building2, description: 'What I offer' },
      { name: 'Testimonials', href: '/work-with-me#testimonials', icon: MessageSquare, description: 'Client feedback' },
    ],
  },
  {
    name: 'Content',
    icon: FileText,
    items: [
      { name: 'Blog', href: '/blog', icon: BookOpen, description: 'Articles and thoughts' },
      { name: 'Topics', href: '/topics', icon: Layers, description: 'Curated topic hubs' },
      { name: 'Series', href: '/series', icon: Layers, description: 'Article series' },
      { name: 'Changelog', href: '/changelog', icon: TrendingUp, description: 'Roadmap + release notes' },
      { name: 'Podcast', href: '/podcast', icon: Mic, description: 'Audio episodes' },
      { name: 'Chat', href: '/chat', icon: MessageSquare, description: 'Talk with AI Lorenzo' },
      { name: 'Lab', href: '/lab', icon: Sparkles, description: 'Interactive demos' },
      { name: 'Guestbook', href: '/guestbook', icon: MessageSquare, description: 'Leave a note' },
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
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Blog', href: '/blog' },
  { name: 'Projects', href: '/projects' },
  { name: 'Work With Me', href: '/work-with-me' },
  { name: 'Contact', href: '/contact' },
  { name: 'Changelog', href: '/changelog' },
];

// All pages for search/sitemap
export const allPages: NavItem[] = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Now', href: '/now' },
  { name: 'Professional', href: '/professional' },
  { name: 'Projects', href: '/projects' },
  { name: 'Work With Me', href: '/work-with-me' },
  { name: 'Services', href: '/work-with-me#services' },
  { name: 'Testimonials', href: '/work-with-me#testimonials' },
  { name: 'Blog', href: '/blog' },
  { name: 'Changelog', href: '/changelog' },
  { name: 'Chat', href: '/chat' },
  { name: 'Guestbook', href: '/guestbook' },
  { name: 'Lab', href: '/lab' },
  { name: 'API Docs', href: '/api-docs' },
  { name: 'Series', href: '/series' },
  { name: 'Podcast', href: '/podcast' },
  { name: 'Bookmarks', href: '/bookmarks' },
  { name: 'Topics', href: '/topics' },
  { name: 'Tags', href: '/tags' },
  { name: 'Books', href: '/books' },
  { name: 'Movies', href: '/movies' },
  { name: 'Uses', href: '/uses' },
  { name: 'Photos', href: '/photos' },
  { name: 'Links', href: '/links' },
  { name: 'Contact', href: '/contact' },
];
