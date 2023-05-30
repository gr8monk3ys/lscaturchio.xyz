'use client';
import React from 'react';
import Image from 'next/legacy/image';
import {HiArrowDown} from 'react-icons/hi';
import ScrollLink from '../ScrollLink';

const HeroSection: React.FC = () => {
  return (
    <section id="home" className="my-10 py-10 md:py-20">
      <div className="container mx-auto px-6 sm:px-12 md:px-20">
        <div className="flex flex-col items-center justify-center animate-fadeIn animation-delay-2 md:flex-row md:justify-between">
          <div className="w-32 h-32 md:w-64 md:h-64 overflow-hidden rounded-full shadow-2xl mb-8 md:mb-0 relative">
            <Image src="/headshot.png" alt="Lorenzo's Headshot" layout="fill" objectFit="cover" className="absolute" />
          </div>
          <div className="md:w-1/2">
            <h1 className="text-3xl font-bold mt-6 md:text-5xl md:mt-0"> I&#39;m Lorenzo</h1>
            <p className="text-md mt-4 md:text-lg">
              I&#39;m a <span className="font-semibold text-blue-600">Data Science Student </span>
              based in Los Angeles, CA. Working on automating my life
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
