// Rule: TypeScript Usage - Use TypeScript for all code
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  Command, 
  CommandDialog, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList, 
  CommandSeparator, 
  CommandShortcut 
} from "@/components/ui/command";
import { useTheme } from "next-themes";
import { 
  FileText, 
  Home, 
  Sun, 
  Moon, 
  Settings, 
  User, 
  Briefcase, 
  Mail, 
  Search, 
  Tag, 
  Archive, 
  Send, 
  PenTool, 
  Github, 
  Twitter, 
  Linkedin, 
  Rss 
} from "lucide-react";
import { navigation } from "@/constants/navlinks";
import { KeyboardShortcut } from "./keyboard-shortcut";
import { socials } from "@/constants/socials";

// Define action types for better type safety
type ActionType = "navigate" | "theme" | "social" | "command";

interface CommandItem {
  id: string;
  name: string;
  shortcut?: string[];
  keywords?: string[];
  section: "navigation" | "blogs" | "theme" | "social" | "actions";
  icon?: React.ReactNode;
  type: ActionType;
  action?: () => void;
  url?: string;
}

export function CommandPalette(): JSX.Element {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  // Toggle the theme between light and dark
  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  // Define commands
  const getCommands = useCallback((): CommandItem[] => {
    // Navigation pages from constants
    const navigationCommands = navigation.map((item) => ({
      id: `nav-${item.href}`,
      name: item.name,
      section: "navigation" as const,
      icon: getIconForPath(item.href),
      type: "navigate" as const,
      url: item.href,
      keywords: [item.name.toLowerCase(), "page", "go to"],
    }));

    // Common blog URLs
    const blogCommands = [
      {
        id: "blog-all",
        name: "All Blog Posts",
        section: "blogs" as const,
        icon: <Archive className="mr-2 h-4 w-4" />,
        type: "navigate" as const,
        url: "/blog/archive",
        keywords: ["blog", "archive", "all posts", "articles"],
      },
      {
        id: "blog-latest",
        name: "Latest Posts",
        section: "blogs" as const,
        icon: <FileText className="mr-2 h-4 w-4" />,
        type: "navigate" as const,
        url: "/blog",
        keywords: ["blog", "latest", "recent", "posts", "articles"],
      },
    ];

    // Theme commands
    const themeCommands = [
      {
        id: "theme-toggle",
        name: theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode",
        shortcut: ["ctrl", "D"],
        section: "theme" as const,
        icon: theme === "dark" ? (
          <Sun className="mr-2 h-4 w-4" />
        ) : (
          <Moon className="mr-2 h-4 w-4" />
        ),
        type: "theme" as const,
        action: toggleTheme,
        keywords: ["theme", "dark mode", "light mode", "toggle", "switch"],
      },
    ];

    // Social media commands
    const socialCommands = socials.map((social) => ({
      id: `social-${social.label}`,
      name: `Visit ${social.label}`,
      section: "social" as const,
      icon: <social.icon className="mr-2 h-4 w-4" />,
      type: "social" as const,
      url: social.href,
      keywords: [social.label.toLowerCase(), "social", "link", "visit"],
    }));

    // Action commands
    const actionCommands = [
      {
        id: "action-search",
        name: "Search",
        shortcut: ["ctrl", "K"],
        section: "actions" as const,
        icon: <Search className="mr-2 h-4 w-4" />,
        type: "command" as const,
        action: () => {
          setOpen(false);
          // Assuming you have a global search dialog that can be opened programmatically
          document.dispatchEvent(new CustomEvent("open-search"));
        },
        keywords: ["search", "find", "lookup"],
      },
      {
        id: "action-contact",
        name: "Contact",
        section: "actions" as const,
        icon: <Mail className="mr-2 h-4 w-4" />,
        type: "navigate" as const,
        url: "/contact",
        keywords: ["contact", "email", "message", "get in touch"],
      },
      {
        id: "action-newsletter",
        name: "Subscribe to Newsletter",
        section: "actions" as const,
        icon: <Send className="mr-2 h-4 w-4" />,
        type: "navigate" as const,
        url: "/newsletter",
        keywords: ["newsletter", "subscribe", "updates", "email"],
      },
      {
        id: "action-rss",
        name: "RSS Feed",
        section: "actions" as const,
        icon: <Rss className="mr-2 h-4 w-4" />,
        type: "navigate" as const,
        url: "/api/rss",
        keywords: ["rss", "feed", "subscribe", "xml"],
      },
    ];

    return [
      ...navigationCommands,
      ...blogCommands,
      ...themeCommands,
      ...socialCommands,
      ...actionCommands,
    ];
  }, [theme, toggleTheme]);

  const commands = getCommands();

  // Handle command execution
  const runCommand = useCallback(
    (command: CommandItem) => {
      setOpen(false);

      switch (command.type) {
        case "navigate":
          if (command.url) {
            if (command.url.startsWith("http")) {
              window.open(command.url, "_blank");
            } else {
              router.push(command.url);
            }
          }
          break;
        case "theme":
          if (command.action) {
            command.action();
          }
          break;
        case "social":
          if (command.url) {
            window.open(command.url, "_blank");
          }
          break;
        case "command":
          if (command.action) {
            command.action();
          }
          break;
        default:
          break;
      }
    },
    [router]
  );

  // Listen for keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command className="rounded-lg border border-stone-200 shadow-md dark:border-stone-700">
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          <CommandGroup heading="Navigation">
            {commands
              .filter((command) => command.section === "navigation")
              .map((command) => (
                <CommandItem
                  key={command.id}
                  onSelect={() => runCommand(command)}
                >
                  {command.icon}
                  <span>{command.name}</span>
                </CommandItem>
              ))}
          </CommandGroup>
          
          <CommandSeparator />
          
          <CommandGroup heading="Blog">
            {commands
              .filter((command) => command.section === "blogs")
              .map((command) => (
                <CommandItem
                  key={command.id}
                  onSelect={() => runCommand(command)}
                >
                  {command.icon}
                  <span>{command.name}</span>
                </CommandItem>
              ))}
          </CommandGroup>
          
          <CommandSeparator />
          
          <CommandGroup heading="Theme">
            {commands
              .filter((command) => command.section === "theme")
              .map((command) => (
                <CommandItem
                  key={command.id}
                  onSelect={() => runCommand(command)}
                >
                  {command.icon}
                  <span>{command.name}</span>
                  {command.shortcut && (
                    <CommandShortcut>
                      <KeyboardShortcut
                        keys={command.shortcut}
                        size="sm"
                      />
                    </CommandShortcut>
                  )}
                </CommandItem>
              ))}
          </CommandGroup>
          
          <CommandSeparator />
          
          <CommandGroup heading="Actions">
            {commands
              .filter((command) => command.section === "actions")
              .map((command) => (
                <CommandItem
                  key={command.id}
                  onSelect={() => runCommand(command)}
                >
                  {command.icon}
                  <span>{command.name}</span>
                  {command.shortcut && (
                    <CommandShortcut>
                      <KeyboardShortcut
                        keys={command.shortcut}
                        size="sm"
                      />
                    </CommandShortcut>
                  )}
                </CommandItem>
              ))}
          </CommandGroup>
          
          <CommandSeparator />
          
          <CommandGroup heading="Social">
            {commands
              .filter((command) => command.section === "social")
              .map((command) => (
                <CommandItem
                  key={command.id}
                  onSelect={() => runCommand(command)}
                >
                  {command.icon}
                  <span>{command.name}</span>
                </CommandItem>
              ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}

// Helper function to determine icon based on path
function getIconForPath(path: string): React.ReactNode {
  switch (path) {
    case "/":
      return <Home className="mr-2 h-4 w-4" />;
    case "/about":
      return <User className="mr-2 h-4 w-4" />;
    case "/blog":
      return <FileText className="mr-2 h-4 w-4" />;
    case "/contact":
      return <Mail className="mr-2 h-4 w-4" />;
    case "/services":
      return <Briefcase className="mr-2 h-4 w-4" />;
    case "/projects":
      return <PenTool className="mr-2 h-4 w-4" />;
    default:
      return <FileText className="mr-2 h-4 w-4" />;
  }
}
