"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from '@/lib/motion';
import Image from "next/image";
import { navigationCategories, contactLink } from '@/constants/navlinks';
import { ThemeToggle } from './theme-toggle';
import { CommandPalette } from './command-palette';
import { NavDropdown } from './nav-dropdown';
import { LanguageSwitcher } from "@/components/i18n/google-translate";

// Animation variants for nav items
const navItemVariants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 25,
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 25,
    },
  },
};

// Underline animation variants
const underlineVariants = {
  initial: {
    scaleX: 0,
    originX: 0,
  },
  hover: {
    scaleX: 1,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 30,
    },
  },
  active: {
    scaleX: 1,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 30,
    },
  },
};

// ============================================
// NAV LINK - Individual navigation link with micro-interactions
// ============================================
interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
}

function NavLink({ href, children, isActive = false }: NavLinkProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      variants={navItemVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Link
        href={href}
        className={`relative px-3 py-2 text-sm font-medium transition-colors block ${
          isActive
            ? 'text-foreground'
            : 'text-foreground/60 hover:text-foreground/80'
        }`}
      >
        {children}
        {/* Animated underline */}
        <motion.div
          className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full"
          variants={underlineVariants}
          initial="initial"
          animate={isActive ? "active" : isHovered ? "hover" : "initial"}
        />
      </Link>
    </motion.div>
  );
}

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    let rafId: number;
    let lastScrolled = false;

    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const scrolled = window.scrollY > 0;
        if (scrolled !== lastScrolled) {
          lastScrolled = scrolled;
          setIsScrolled(scrolled);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // initial check

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const closeAllDropdowns = useCallback(() => {
    setOpenDropdown(null);
  }, []);

  const handleDropdownChange = useCallback((name: string, isOpen: boolean) => {
    if (isOpen) {
      setOpenDropdown(name);
    } else if (openDropdown === name) {
      setOpenDropdown(null);
    }
  }, [openDropdown]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[50] hidden md:block transition-all duration-300 ${
          isScrolled
            ? 'bg-background/90 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md'
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <div className="w-[200px]">
              <Link href="/" className="flex items-center">
                <Image
                  src="/cursive.svg"
                  alt="Lorenzo Scaturchio"
                  width={200}
                  height={40}
                  priority
                  className="w-auto h-14 dark:invert"
                />
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="flex items-center">
              <ul className="flex items-center space-x-2 rounded-full border border-border bg-background/80 px-3 py-2 shadow-[inset_0_1px_0_hsl(var(--border))] backdrop-blur">
                {/* Category Dropdowns */}
                {navigationCategories.map((category) => (
                  <li key={category.name}>
                    <NavDropdown
                      category={category}
                      onOpenChange={(isOpen) => handleDropdownChange(category.name, isOpen)}
                      closeOthers={closeAllDropdowns}
                    />
                  </li>
                ))}

                {/* Contact Link with enhanced hover animation */}
                <li>
                  <NavLink
                    href={contactLink.href}
                    isActive={pathname === contactLink.href}
                  >
                    {contactLink.name}
                  </NavLink>
                </li>
              </ul>
            </nav>

            {/* Search and theme toggle */}
            <div className="w-[290px] flex justify-end items-center gap-2">
              <LanguageSwitcher />
              <CommandPalette />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>
      <div className="h-20 hidden md:block" /> {/* Spacer for fixed header */}
    </>
  );
}
