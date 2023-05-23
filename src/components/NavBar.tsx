// components/NavBar.tsx
import Link from 'next/link';
import React from 'react';

const NavBar: React.FC = () => (
  <nav className="bg-blue-500">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center">
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/">
                <a className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Home</a>
              </Link>
              <Link href="/about">
                <a className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">About</a>
              </Link>
              <Link href="/contact">
                <a className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Contact</a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
);

export default NavBar;
