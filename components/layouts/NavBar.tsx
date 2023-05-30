'use client'; // this is a client component
import React, {useState} from 'react';
import {Link} from 'react-scroll/modules';
import {useTheme} from 'next-themes';
import {RiMoonFill, RiSunLine} from 'react-icons/ri';
import {IoMdMenu, IoMdClose} from 'react-icons/io';

interface NavItem {
  label: string;
  page: string;
}

const NAV_ITEMS: Array<NavItem> = [
  {
    label: 'Home',
    page: 'home',
  },
  {
    label: 'About',
    page: 'about',
  },
  {
    label: 'Blog',
    page: 'posts',
  },
  {
    label: 'Projects',
    page: 'projects',
  },
];

export default function Navbar() {
  const {systemTheme, theme, setTheme} = useTheme();
  const currentTheme = theme === 'system' ? systemTheme : theme;
  const [navbar, setNavbar] = useState(false);

  const handleNavbarLinkClick = () => {
    if (navbar) {
      setNavbar(false);
    }
  };

  return (
    <header className="w-full mx-auto px-4 sm:px-6 lg:px-20 fixed top-0 z-50 shadow-md bg-white dark:bg-gray-800">
      <div className="flex justify-between items-center py-5 max-w-screen-xl mx-auto">
        <Link to="home" className="text-2xl font-bold text-blue-600 hover:text-blue-500 transition-colors duration-300">
          Lorenzo Scaturchio
        </Link>
        <div className="md:hidden">
          <button
            className="p-2 text-gray-700 rounded-md focus:outline-none focus:border-gray-400"
            onClick={() => setNavbar(!navbar)}>
            {navbar ? <IoMdClose size={24} /> : <IoMdMenu size={24} />}
          </button>
        </div>
        <nav className={`${navbar ? 'block' : 'hidden'} md:block md:space-x-6`}>
          {NAV_ITEMS.map((item, idx) => (
            <Link
              key={idx}
              to={item.page}
              activeClass="text-blue-600"
              spy={true}
              smooth={true}
              offset={-70}
              duration={500}
              className="block mt-4 text-sm font-medium text-gray-600 hover:text-blue-600 dark:hover:text-blue-400 dark:text-gray-200 md:inline-block md:mt-0 transition-colors duration-300"
              onClick={handleNavbarLinkClick}>
              {item.label}
            </Link>
          ))}
          {/* <button
            className="mt-4 md:mt-0 md:ml-6 inline-flex items-center justify-center h-10 w-10 rounded-full transition-colors duration-300 focus:outline-none"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {currentTheme === 'dark' ? <RiSunLine size={24} /> : <RiMoonFill size={24} />}
          </button> */}
        </nav>
      </div>
    </header>
  );
}
