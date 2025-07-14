"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from "next/image";
import { navigation } from '@/constants/navlinks';

// Rule: TypeScript Usage - Use TypeScript for all code
export function Navbar({ children }: { children?: React.ReactNode }): JSX.Element {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[50] backdrop-blur-sm transition-all ${
          isScrolled ? 'shadow-[0_3px_6px_rgba(0,0,0,0.05),0_2px_4px_rgba(255,255,255,0.1)] dark:shadow-[0_3px_6px_rgba(0,0,0,0.2),0_1px_3px_rgba(255,255,255,0.02)] bg-stone-50/95 dark:bg-stone-900/95' : 'bg-stone-50/0 dark:bg-stone-900/0'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="w-[200px]">
              <Link href="/" className="flex items-center">
                <Image
                  src="/signature.svg"
                  alt="Lorenzo Scaturchio"
                  width={200}
                  height={40}
                  priority
                  className="h-16" 
                  style={{ width: 'auto' }}
                />
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex flex-1 justify-center">
              <nav className="absolute left-1/2 -translate-x-1/2">
                <ul className="flex items-center space-x-8">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`relative px-3 py-2 text-sm font-medium transition-all ${
                          pathname === item.href
                            ? 'text-stone-800 dark:text-stone-100'
                            : 'text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:translate-y-[-1px]'
                        }`}
                      >
                        {item.name}
                        {pathname === item.href && (
                          <motion.div
                            className="absolute bottom-0 left-0 h-0.5 w-full bg-primary shadow-[0_0_2px_rgba(0,0,0,0.1)]"
                            layoutId="navbar-underline"
                            transition={{ type: "spring", bounce: 0.25 }}
                          />
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* Right section - theme toggle and other controls */}
            <div className="w-[200px] flex justify-end items-center">
              {children}
            </div>
          </div>
        </div>
      </header>
      <div className="h-16" /> {/* Spacer for fixed header */}
    </>
  );
}
