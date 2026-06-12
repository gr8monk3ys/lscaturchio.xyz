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

export const primaryNavigation: NavItem[] = [
  { name: 'Writing', href: '/blog', icon: BookOpen, description: 'Essays and engineering notes' },
  { name: 'Projects', href: '/projects', icon: FolderKanban, description: 'Things I built' },
  { name: 'About', href: '/about', icon: User, description: 'Who I am' },
  { name: 'Work With Me', href: '/work-with-me', icon: Sparkles, description: 'Hire me for AI/RAG work' },
];

export const secondaryNavigationCategories: NavCategory[] = navigationCategories
  .map((category) => {
    if (category.name === 'Work') {
      return {
        ...category,
        items: category.items.filter(
          (item) => item.href !== '/projects' && item.href !== '/work-with-me'
        ),
      };
    }

    if (category.name === 'Content') {
      return {
        ...category,
        items: category.items.filter((item) => item.href !== '/blog'),
      };
    }

    return category;
  })
  .filter((category) => category.items.length > 0);

// Contact link (always visible)
export const contactLink: NavItem = {
  name: 'Contact',
  href: '/contact',
  icon: Mail
};

// Footer site map. The header stays slim (primaryNavigation); the footer
// carries the full breadth of the garden so no page loses a doorway.
// Curated separately from navigationCategories because the groupings differ
// (Content → Writing, Personal → Garden, Uses lives under Work, etc.).
export const footerColumns: NavCategory[] = [
  {
    name: 'Writing',
    items: [
      { name: 'Blog', href: '/blog' },
      { name: 'Topics', href: '/topics' },
      { name: 'Series', href: '/series' },
      { name: 'Podcast', href: '/podcast' },
      { name: 'Changelog', href: '/changelog' },
    ],
  },
  {
    name: 'Work',
    items: [
      { name: 'Projects', href: '/projects' },
      { name: 'Work With Me', href: '/work-with-me' },
      { name: 'Services', href: '/work-with-me#services' },
      { name: 'Uses', href: '/uses' },
    ],
  },
  {
    name: 'Garden',
    items: [
      { name: 'Books', href: '/books' },
      { name: 'Movies', href: '/movies' },
      { name: 'Photos', href: '/photos' },
      { name: 'Now', href: '/now' },
      { name: 'Lab', href: '/lab' },
      { name: 'Guestbook', href: '/guestbook' },
      { name: 'Links', href: '/links' },
    ],
  },
  {
    name: 'About',
    items: [
      { name: 'About Me', href: '/about' },
      { name: 'Professional', href: '/professional' },
      { name: 'Chat', href: '/chat' },
      { name: 'Contact', href: '/contact' },
    ],
  },
];
