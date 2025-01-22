"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconMessageCircle } from '@tabler/icons-react';
import ChatModal from './chat-modal';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Blog', href: '/blog' },
  { name: 'Work', href: '/work' },
  { name: 'FAQ', href: '/faq' },
  { name: 'Contact', href: '/contact' },
];

export function Navbar() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleOpenChat = () => setIsChatOpen(true);
    window.addEventListener('openChat', handleOpenChat);
    return () => window.removeEventListener('openChat', handleOpenChat);
  }, []);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="text-xl font-bold">
                Lorenzo Scaturchio
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden sm:block">
              <div className="flex space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      pathname === item.href
                        ? 'text-foreground'
                        : 'text-foreground/60 hover:text-foreground/80'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Chat Button */}
            <button
              onClick={() => setIsChatOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"
              aria-label="Open chat"
            >
              <IconMessageCircle className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Add padding to account for fixed navbar */}
      <div className="h-16" />

      <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
}
