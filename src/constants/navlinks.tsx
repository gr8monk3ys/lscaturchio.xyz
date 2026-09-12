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

/**
 * Every destination, named once, with its icon and its one-line description.
 *
 * This is the flat half of the module: what a thing is called, not where it
 * sits. Three separate maps used to hold these facts — one inside
 * `navigationCategories`, one inside `primaryNavigation`, and `PALETTE_ICONS`
 * bolted on for the destinations only the footer carried — so an icon or a
 * description could be right in one nav and absent in another.
 */
const NAV_META: Record<string, { name: string; icon: NavCategory['icon']; description?: string }> = {
  '/': { name: 'Home', icon: Home, description: 'The front door' },
  '/about': { name: 'About', icon: User, description: 'Who I am' },
  '/professional': { name: 'Hire me', icon: Briefcase, description: 'Experience, tools and the resume' },
  '/projects': { name: 'Projects', icon: FolderKanban, description: 'Things I built' },
  '/work-with-me': { name: 'Consulting', icon: Sparkles, description: 'Contract and build engagements' },
  '/uses': { name: 'Uses', icon: Wrench, description: 'My setup and tools' },
  '/blog': { name: 'Writing', icon: BookOpen, description: 'Essays and engineering notes' },
  '/topics': { name: 'Topics', icon: Layers, description: 'Curated topic hubs' },
  '/series': { name: 'Series', icon: Layers, description: 'Essays that run in sequence' },
  '/podcast': { name: 'Podcast', icon: Mic, description: 'Audio episodes' },
  '/changelog': { name: 'Changelog', icon: TrendingUp, description: 'Roadmap and release notes' },
  '/garden': { name: 'Garden', icon: Sparkles, description: 'Books, films, music, experiments' },
  '/books': { name: 'Books', icon: Book, description: "What I'm reading" },
  '/movies': { name: 'Movies', icon: Film, description: "Films I've watched" },
  '/music': { name: 'Music', icon: Music, description: 'What is on the turntable' },
  '/photos': { name: 'Photography', icon: Camera, description: 'Travel and landscape work' },
  '/now': { name: 'Now', icon: Clock, description: "What I'm up to" },
  '/lab': { name: 'Lab', icon: Sparkles, description: 'Interactive demos' },
  '/guestbook': { name: 'Guestbook', icon: MessageSquare, description: 'Leave a note' },
  '/links': { name: 'Links', icon: Link2, description: 'Elsewhere on the internet' },
  '/chat': { name: 'Ask', icon: MessageSquare, description: 'A conversation with the essays' },
  '/contact': { name: 'Contact', icon: Mail, description: 'Start a conversation' },
  '/bookmarks': { name: 'Bookmarks', icon: Bookmark, description: 'Essays saved for later' },
};

/** One destination, resolved from the single naming source. */
function item(href: string): NavItem {
  const meta = NAV_META[href];
  if (!meta) throw new Error(`navlinks: no NAV_META entry for ${href}`);
  return { name: meta.name, href, icon: meta.icon, description: meta.description };
}

/**
 * The site's one grouping of itself.
 *
 * There were two, and they disagreed about twelve of twenty destinations.
 * The footer filed `/blog` under "Writing" while the mobile panel filed it
 * under "Content"; `/now` was "Garden" in one and "About" in the other;
 * `/uses` was "Work" and "Personal"; `/lab`, `/chat`, `/books`, `/movies`,
 * `/photos`, `/links`, `/topics`, `/podcast`, `/changelog` and `/guestbook`
 * all split the same way. "Garden" was a primary destination and a footer
 * group but did not exist in the mobile panel at all.
 *
 * That is invisible to `design-drift.test.ts`'s navigation-vocabulary rule,
 * which asserts one *name* per href and cannot see the same href sitting in
 * two differently-named groups — the drift suite's own lesson, one level up
 * the tree: a rule that cannot reach a fact is indistinguishable from a rule
 * that passes it.
 *
 * Group names come from the site's own vocabulary, which is why they match the
 * header: Writing, Work, Garden, About are the words the primary nav already
 * uses. "Content" and "Personal" were a fifth and sixth vocabulary that
 * existed only in the mobile drawer.
 */
const SITE_GROUPS: Array<{ name: string; icon: NavCategory['icon']; hrefs: string[] }> = [
  {
    name: 'Writing',
    icon: FileText,
    hrefs: ['/blog', '/topics', '/series', '/podcast', '/changelog'],
  },
  {
    name: 'Work',
    icon: Briefcase,
    hrefs: ['/projects', '/work-with-me', '/uses'],
  },
  {
    name: 'Garden',
    icon: Heart,
    hrefs: ['/books', '/music', '/movies', '/photos', '/now', '/lab', '/guestbook', '/links'],
  },
  {
    name: 'About',
    icon: User,
    hrefs: ['/about', '/professional', '/chat', '/contact'],
  },
];

/**
 * Categorised navigation, derived rather than declared.
 *
 * The mobile drawer renders this (through `secondaryNavigationCategories`) and
 * the footer renders `footerColumns`. Both now come from `SITE_GROUPS`, so a
 * destination cannot be filed in one place and refiled in another.
 */
export const navigationCategories: NavCategory[] = SITE_GROUPS.map((group) => ({
  name: group.name,
  icon: group.icon,
  items: group.hrefs.map(item),
}));

/**
 * The header. Deliberately explicit and deliberately short: five destinations
 * chosen for a slim bar, not a slice of the taxonomy.
 */
export const primaryNavigation: NavItem[] = [
  '/blog',
  '/projects',
  '/garden',
  '/about',
  '/professional',
].map(item);

/**
 * Everything the header does not already carry, for the mobile drawer.
 *
 * This used to name the three hrefs in `primaryNavigation` literally, in a
 * filter that had to be edited whenever the header changed — and was not, so
 * retargeting "Hire me" would have shown it twice.
 */
const primaryHrefs = new Set(primaryNavigation.map((navItem) => navItem.href));

export const secondaryNavigationCategories: NavCategory[] = navigationCategories
  .map((category) => ({
    ...category,
    items: category.items.filter((navItem) => !primaryHrefs.has(navItem.href)),
  }))
  .filter((category) => category.items.length > 0);

// Contact link (always visible)
export const contactLink: NavItem = item('/contact');

// Footer site map. The header stays slim (primaryNavigation); the footer
// carries the full breadth of the garden so no page loses a doorway — and it
// carries it in the same groups the mobile drawer uses, because both read
// SITE_GROUPS.
export const footerColumns: NavCategory[] = navigationCategories;

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
export const paletteDestinations: NavItem[] = (() => {
  const ordered = [
    '/',
    ...primaryNavigation.map((navItem) => navItem.href),
    ...SITE_GROUPS.flatMap((group) => group.hrefs),
    '/bookmarks',
  ];

  const seen = new Set<string>();
  return ordered.reduce<NavItem[]>((items, href) => {
    if (seen.has(href)) return items;
    seen.add(href);
    items.push(item(href));
    return items;
  }, []);
})();
