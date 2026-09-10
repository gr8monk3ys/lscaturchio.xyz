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
      { name: 'About', href: '/about', icon: User, description: 'Who I am' },
      { name: 'Now', href: '/now', icon: Clock, description: 'What I\'m up to' },
      { name: 'Hire me', href: '/professional', icon: Briefcase, description: 'Experience, tools and the resume' },
    ],
  },
  {
    name: 'Work',
    icon: Briefcase,
    items: [
      { name: 'Projects', href: '/projects', icon: FolderKanban, description: 'Things I built' },
      { name: 'Consulting', href: '/work-with-me', icon: Sparkles, description: 'Contract and build engagements' },
    ],
  },
  {
    name: 'Content',
    icon: FileText,
    items: [
      { name: 'Writing', href: '/blog', icon: BookOpen, description: 'Essays and engineering notes' },
      { name: 'Topics', href: '/topics', icon: Layers, description: 'Curated topic hubs' },
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
  { name: 'Garden', href: '/garden', icon: Sparkles, description: 'Books, films, music, experiments' },
  { name: 'About', href: '/about', icon: User, description: 'Who I am' },
  { name: 'Hire me', href: '/professional', icon: Briefcase, description: 'Experience, tools and the resume' },
];

/**
 * Everything the header does not already carry, for the mobile drawer.
 *
 * This used to name the three hrefs in `primaryNavigation` literally, in a
 * filter that had to be edited whenever the header changed — and was not, so
 * retargeting "Hire me" would have shown it twice.
 */
const primaryHrefs = new Set(primaryNavigation.map((item) => item.href));

export const secondaryNavigationCategories: NavCategory[] = navigationCategories
  .map((category) => ({
    ...category,
    items: category.items.filter((item) => !primaryHrefs.has(item.href)),
  }))
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
      { name: 'Writing', href: '/blog' },
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
      { name: 'Consulting', href: '/work-with-me' },
      { name: 'Uses', href: '/uses' },
    ],
  },
  {
    name: 'Garden',
    items: [
      { name: 'Books', href: '/books' },
      { name: 'Music', href: '/music' },
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
      { name: 'About', href: '/about' },
      { name: 'Hire me', href: '/professional' },
      { name: 'Chat', href: '/chat' },
      { name: 'Contact', href: '/contact' },
    ],
  },
];
