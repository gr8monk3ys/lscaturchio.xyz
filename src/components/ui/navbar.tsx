"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from "next/image";
import { navigation } from '@/constants/navlinks';

export function Navbar() {
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
          isScrolled ? 'border-b bg-background/80' : 'bg-background/0'
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
                  className="w-auto h-16"
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
                        className={`relative px-3 py-2 text-sm font-medium transition-colors ${
                          pathname === item.href
                            ? 'text-foreground'
                            : 'text-foreground/60 hover:text-foreground/80'
                        }`}
                      >
                        {item.name}
                        {pathname === item.href && (
                          <motion.div
                            className="absolute bottom-0 left-0 h-0.5 w-full bg-primary"
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

            {/* Empty div for layout balance */}
            <div className="w-[200px]" />
          </div>
        </div>
      </header>
      <div className="h-16" /> {/* Spacer for fixed header */}
    </>
  );
}
