"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { navigation } from '@/constants/navlinks';

const navItemVariants = {
  closed: { opacity: 0, y: 20 },
  open: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
    },
  }),
};

export function MobileNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="fixed top-0 right-0 z-[200] p-4 md:hidden">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-50 dark:bg-stone-800 shadow-[2px_2px_4px_rgba(0,0,0,0.1),-2px_-2px_4px_rgba(255,255,255,0.7)] dark:shadow-[2px_2px_4px_rgba(0,0,0,0.3),-1px_-1px_3px_rgba(255,255,255,0.05)] hover:shadow-[1px_1px_2px_rgba(0,0,0,0.05),-1px_-1px_2px_rgba(255,255,255,0.6)] dark:hover:shadow-[1px_1px_2px_rgba(0,0,0,0.2),-0.5px_-0.5px_1px_rgba(255,255,255,0.03)] transform transition-all"
          aria-label="Toggle menu"
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
            className="fixed inset-0 z-[150] flex flex-col bg-stone-50 dark:bg-stone-900 md:hidden backdrop-blur-sm"
          >
            <div className="flex h-full w-full flex-col items-center justify-center space-y-8 p-6">
              {navigation.map((item, i) => (
                <motion.div
                  key={item.name}
                  custom={i}
                  initial="closed"
                  animate="open"
                  variants={navItemVariants}
                  className="w-full max-w-sm"
                >
                  <Link
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block w-full rounded-lg px-4 py-3 text-center text-xl font-medium transition-all ${
                      pathname === item.href
                        ? 'bg-stone-100 dark:bg-stone-800 text-foreground shadow-[2px_2px_4px_rgba(0,0,0,0.05),-2px_-2px_4px_rgba(255,255,255,0.7)] dark:shadow-[2px_2px_4px_rgba(0,0,0,0.2),-1px_-1px_3px_rgba(255,255,255,0.05)]'
                        : 'text-foreground/60 hover:bg-stone-100 dark:hover:bg-stone-800 hover:shadow-[1px_1px_2px_rgba(0,0,0,0.05),-1px_-1px_2px_rgba(255,255,255,0.6)] dark:hover:shadow-[1px_1px_2px_rgba(0,0,0,0.2),-0.5px_-0.5px_1px_rgba(255,255,255,0.03)] hover:text-foreground transform hover:scale-105'
                    }`}
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
