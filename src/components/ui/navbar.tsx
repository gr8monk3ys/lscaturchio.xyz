"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from "next/image";
import { navigationCategories, contactLink } from '@/constants/navlinks';
import { ThemeToggle } from './theme-toggle';
import { SearchModal } from './search-modal';
import { NavDropdown } from './nav-dropdown';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRefs = useRef<Map<string, () => void>>(new Map());
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
        className={`fixed inset-x-0 top-0 z-[50] backdrop-blur-sm transition-all duration-300 hidden md:block ${
          isScrolled ? 'bg-background/90 shadow-[0_4px_12px_rgba(0,0,0,0.05)]' : 'bg-background/0'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="w-[180px]">
              <Link href="/" className="flex items-center">
                <Image
                  src="/cursive.svg"
                  alt="Lorenzo Scaturchio"
                  width={180}
                  height={36}
                  priority
                  className="w-auto h-14"
                />
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="flex items-center">
              <ul className="flex items-center space-x-1">
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

                {/* Contact Link */}
                <li>
                  <Link
                    href={contactLink.href}
                    className={`relative px-3 py-2 text-sm font-medium transition-colors ${
                      pathname === contactLink.href
                        ? 'text-foreground'
                        : 'text-foreground/60 hover:text-foreground/80'
                    }`}
                  >
                    {contactLink.name}
                    {pathname === contactLink.href && (
                      <motion.div
                        className="absolute bottom-0 left-0 h-0.5 w-full bg-primary"
                        layoutId="navbar-underline"
                        transition={{ type: "spring" as const, bounce: 0.25 }}
                      />
                    )}
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Search and theme toggle */}
            <div className="w-[180px] flex justify-end items-center gap-2">
              <SearchModal />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>
      <div className="h-16 hidden md:block" /> {/* Spacer for fixed header */}
    </>
  );
}
