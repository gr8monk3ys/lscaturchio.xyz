"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { NavCategory } from '@/constants/navlinks';

// Animation variants for dropdown button
const buttonVariants = {
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

// Animation variants for underline
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

// Animation variants for dropdown menu items
const menuItemVariants = {
  initial: {
    x: 0,
    backgroundColor: "transparent",
  },
  hover: {
    x: 4,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 25,
    },
  },
};

interface NavDropdownProps {
  category: NavCategory;
  onOpenChange?: (isOpen: boolean) => void;
  closeOthers?: () => void;
}

export function NavDropdown({ category, onOpenChange, closeOthers }: NavDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  const prevPathnameRef = useRef(pathname);

  // Check if any item in this category is active
  const hasActiveItem = category.items.some(item => pathname === item.href);

  // Close dropdown on pathname change - this is a necessary pattern for nav dropdowns
  // that need to close after navigation. The setState here responds to route changes
  // from Next.js router, which is an external state source. This is acceptable per
  // React docs: https://react.dev/learn/synchronizing-with-effects#subscribing-to-events
  useEffect(() => {
    if (pathname !== prevPathnameRef.current) {
      prevPathnameRef.current = pathname;
      if (isOpen) {
        setIsOpen(false);
        onOpenChange?.(false);
      }
    }
  }, [pathname, isOpen, onOpenChange]);

  const openDropdown = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    closeOthers?.();
    setIsOpen(true);
    onOpenChange?.(true);
  }, [closeOthers, onOpenChange]);

  const closeDropdown = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      onOpenChange?.(false);
    }, 150);
  }, [onOpenChange]);

  const cancelClose = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        onOpenChange?.(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onOpenChange]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Reset focused index when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setFocusedIndex(-1);
    }
  }, [isOpen]);

  // Keyboard navigation handler
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!isOpen) {
      // Open dropdown on Enter, Space, or ArrowDown when closed
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
        event.preventDefault();
        openDropdown();
        setFocusedIndex(0);
        return;
      }
      return;
    }

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        onOpenChange?.(false);
        buttonRef.current?.focus();
        break;
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex(prev =>
          prev < category.items.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex(prev =>
          prev > 0 ? prev - 1 : category.items.length - 1
        );
        break;
      case 'Home':
        event.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setFocusedIndex(category.items.length - 1);
        break;
      case 'Tab':
        // Close dropdown when tabbing away
        setIsOpen(false);
        onOpenChange?.(false);
        break;
    }
  }, [isOpen, category.items.length, openDropdown, onOpenChange]);

  // Focus the item when focusedIndex changes
  useEffect(() => {
    if (focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex]);

  return (
    <div
      ref={dropdownRef}
      className="relative"
      onMouseEnter={openDropdown}
      onMouseLeave={closeDropdown}
    >
      <motion.button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        variants={buttonVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        className={`relative flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-full ${
          hasActiveItem
            ? 'text-foreground'
            : 'text-foreground/60 hover:text-foreground/80'
        }`}
      >
        {category.name}
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: "spring" as const, stiffness: 300, damping: 20 }}
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </motion.span>
        {/* Animated underline for dropdown button */}
        <motion.div
          className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full"
          variants={underlineVariants}
          initial="initial"
          animate={hasActiveItem ? "active" : isOpen ? "hover" : "initial"}
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' as const }}
            onMouseEnter={cancelClose}
            onMouseLeave={closeDropdown}
            className="absolute left-1/2 -translate-x-1/2 top-full pt-3 z-50"
          >
            <div
              className="neu-card rounded-2xl p-2 min-w-[220px] shadow-[0_16px_40px_rgba(0,0,0,0.12)] border border-border/60 bg-background/95 backdrop-blur"
              role="menu"
              aria-orientation="vertical"
              onKeyDown={handleKeyDown}
            >
              <div className="space-y-1">
                {category.items.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  const isFocused = focusedIndex === index;

                  return (
                    <motion.div
                      key={item.href}
                      variants={menuItemVariants}
                      initial="initial"
                      whileHover="hover"
                    >
                      <Link
                        ref={(el) => { itemRefs.current[index] = el; }}
                        href={item.href}
                        role="menuitem"
                        tabIndex={isFocused ? 0 : -1}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset ${
                          isActive
                            ? 'neu-pressed bg-primary/10 text-primary'
                            : 'hover:bg-muted/40'
                        } ${isFocused ? 'bg-muted/50' : ''}`}
                      >
                        {Icon && (
                          <motion.span
                            whileHover={{ scale: 1.2, rotate: 5 }}
                            transition={{ type: "spring" as const, stiffness: 400, damping: 15 }}
                          >
                            <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                          </motion.span>
                        )}
                        <div className="flex flex-col">
                          <span className={`text-sm font-medium ${isActive ? 'text-primary' : ''}`}>
                            {item.name}
                          </span>
                          {item.description && (
                            <span className="text-xs text-muted-foreground">
                              {item.description}
                            </span>
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
