import {
  User,
  FileText,
  Briefcase,
  BookOpen,
  Bookmark,
  FolderKanban,
  Home,
  Layers,
  Clock,
  Link2,
  Music,
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
      { name: 'Ask', href: '/chat', icon: MessageSquare, description: 'A conversation with the essays' },
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
      { name: 'Photography', href: '/photos', icon: Camera, description: 'Travel and landscape work' },
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
      { name: 'Photography', href: '/photos' },
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
      { name: 'Ask', href: '/chat' },
      { name: 'Contact', href: '/contact' },
    ],
  },
];

/**
 * Icons for destinations that only the footer carries.
 *
 * `footerColumns` is deliberately iconless — a footer site map is a text list.
 * The command palette needs a glyph per row, so the mapping lives here rather
 * than forcing icons into the footer data or letting the palette invent them.
 */
const PALETTE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  '/': Home,
  '/blog': BookOpen,
  '/topics': Layers,
  '/series': Layers,
  '/podcast': Mic,
  '/changelog': TrendingUp,
  '/projects': FolderKanban,
  '/work-with-me': Sparkles,
  '/uses': Wrench,
  '/books': Book,
  '/music': Music,
  '/movies': Film,
  '/photos': Camera,
  '/now': Clock,
  '/lab': Sparkles,
  '/guestbook': MessageSquare,
  '/links': Link2,
  '/about': User,
  '/professional': Briefcase,
  '/chat': MessageSquare,
  '/contact': Mail,
  '/garden': Sparkles,
  '/bookmarks': Bookmark,
};

/**
 * Every destination the command palette can reach, with the name the rest of
 * the site already uses for it.
 *
 * The palette used to hardcode its own eight entries with its own labels, so
 * `/blog` was "Blog" there and "Writing" in both persistent navigations,
 * `/chat` was "AI Chat" against the footer's "Chat", and `/professional` — the
 * page both navs promote as "Hire me" — was unreachable. The drift suite has a
 * rule named "gives every destination exactly one name" that was written after
 * exactly that bug, but it collects from this module, so a third navigation
 * declared in a hook was invisible to it by *scope* rather than by allowance.
 *
 * Deriving the list here is the fix: the existing rule now covers the palette
 * for free, because the palette no longer has a vocabulary of its own.
 * `no-hardcoded-destination` in design-drift.test.ts keeps it that way.
 */
const DESCRIPTIONS_BY_HREF = new Map<string, string>([
  ...[...navigationCategories.flatMap((category) => category.items), ...primaryNavigation]
    .filter((item): item is NavItem & { description: string } => Boolean(item.description))
    .map((item): [string, string] => [item.href, item.description]),
  // Footer-only destinations, which carry no description of their own because
  // a footer site map does not print one. Every palette row shows one, so the
  // three that would otherwise render bare get theirs here.
  ['/series', 'Essays that run in sequence'],
  ['/music', 'What is on the turntable'],
  ['/contact', 'Start a conversation'],
]);

export const paletteDestinations: NavItem[] = (() => {
  const ordered: NavItem[] = [
    { name: 'Home', href: '/', description: 'The front door' },
    ...primaryNavigation,
    ...footerColumns.flatMap((column) => column.items),
    contactLink,
    { name: 'Bookmarks', href: '/bookmarks', description: 'Essays saved for later' },
  ];

  const seen = new Set<string>();
  return ordered.reduce<NavItem[]>((items, item) => {
    if (seen.has(item.href)) return items;
    seen.add(item.href);
    items.push({
      ...item,
      icon: item.icon ?? PALETTE_ICONS[item.href],
      description: item.description ?? DESCRIPTIONS_BY_HREF.get(item.href),
    });
    return items;
  }, []);
})();
