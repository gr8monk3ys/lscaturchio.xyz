"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { NavCategory } from '@/constants/navlinks';

interface NavDropdownProps {
  category: NavCategory;
  onOpenChange?: (isOpen: boolean) => void;
  closeOthers?: () => void;
}

export function NavDropdown({ category, onOpenChange, closeOthers }: NavDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
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

  return (
    <div
      ref={dropdownRef}
      className="relative"
      onMouseEnter={openDropdown}
      onMouseLeave={closeDropdown}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors ${
          hasActiveItem
            ? 'text-foreground'
            : 'text-foreground/60 hover:text-foreground/80'
        }`}
      >
        {category.name}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            onMouseEnter={cancelClose}
            onMouseLeave={closeDropdown}
            className="absolute left-1/2 -translate-x-1/2 top-full pt-2 z-50"
          >
            <div className="neu-card rounded-xl p-2 min-w-[200px] shadow-lg border border-border/50">
              <div className="space-y-1">
                {category.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                        isActive
                          ? 'neu-pressed bg-primary/10 text-primary'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      {Icon && (
                        <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
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
