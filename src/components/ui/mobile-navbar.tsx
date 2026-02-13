"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { navigationCategories, contactLink } from '@/constants/navlinks';
import { ThemeToggle } from './theme-toggle';
import { SearchButton } from '../search/search-button';

export function MobileNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const pathname = usePathname();

  const toggleCategory = (name: string) => {
    setExpandedCategory(expandedCategory === name ? null : name);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="fixed top-0 right-0 z-[450] p-4 md:hidden">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-xl neu-button"
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation-menu"
        >
          {isMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </motion.button>
      </div>

      {/* Full Screen Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            id="mobile-navigation-menu"
            className="fixed inset-0 z-[400] flex flex-col bg-background/95 backdrop-blur-sm md:hidden overflow-y-auto"
          >
            <div className="flex flex-col w-full max-w-md mx-auto p-6 pt-20 space-y-2">
              {/* Category Sections */}
              {navigationCategories.map((category, categoryIndex) => {
                const Icon = category.icon;
                const isExpanded = expandedCategory === category.name;
                const hasActiveItem = category.items.some(item => pathname === item.href);

                return (
                  <motion.div
                    key={category.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + categoryIndex * 0.05 }}
                    className="space-y-1"
                  >
                    {/* Category Header */}
                    <button
                      onClick={() => toggleCategory(category.name)}
                      className={`flex items-center justify-between w-full rounded-xl px-4 py-3 text-lg font-medium transition-colors ${
                        hasActiveItem
                          ? 'text-primary'
                          : 'text-foreground/80 hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {Icon && <Icon className="h-5 w-5" />}
                        {category.name}
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Category Items */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="pl-4 space-y-1">
                            {category.items.map((item) => {
                              const ItemIcon = item.icon;
                              const isActive = pathname === item.href;

                              return (
                                <Link
                                  key={item.href}
                                  href={item.href}
                                  onClick={() => setIsMenuOpen(false)}
                                  className={`flex items-center gap-3 rounded-lg px-4 py-2.5 transition-colors ${
                                    isActive
                                      ? 'neu-pressed-sm bg-primary/10 text-primary'
                                      : 'text-foreground/70 hover:bg-muted/50 hover:text-foreground'
                                  }`}
                                >
                                  {ItemIcon && (
                                    <ItemIcon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                                  )}
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium">{item.name}</span>
                                    {item.description && (
                                      <span className="text-xs text-muted-foreground">{item.description}</span>
                                    )}
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}

              {/* Contact Link */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Link
                  href={contactLink.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 w-full rounded-xl px-4 py-3 text-lg font-medium transition-colors ${
                    pathname === contactLink.href
                      ? 'neu-pressed bg-primary/10 text-primary'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  {contactLink.icon && <contactLink.icon className="h-5 w-5" />}
                  {contactLink.name}
                </Link>
              </motion.div>

              {/* Search and Theme Toggle */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="pt-6 flex items-center justify-center gap-4"
              >
                <SearchButton />
                <ThemeToggle />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
