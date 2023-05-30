'use client';
import {BsArrowLeftShort} from 'react-icons/bs';
import Link from 'next/link';
import {useTheme} from 'next-themes';

export default function GoBack() {
  const {systemTheme, theme} = useTheme();
  const currentTheme = theme === 'system' ? systemTheme : theme;

  return (
    <header className="w-full mx-auto px-4 sm:px-6 lg:px-20 fixed top-0 z-50 shadow-md bg-white dark:bg-gray-800">
      <div className="flex justify-between items-center py-5 max-w-screen-xl mx-auto">
        <Link href="/">
          <div className="flex items-center text-2xl font-bold text-blue-600 hover:text-blue-500 transition-colors duration-300 cursor-pointer">
            <BsArrowLeftShort size={30} className="mr-2" />
            Go back
          </div>
        </Link>
        {/* If you want to add more elements in the header, they go here. */}
      </div>
    </header>
  );
}
