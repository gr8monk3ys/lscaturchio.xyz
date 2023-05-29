'use client';
import React from 'react';
import Image from 'next/image';
import {HiArrowDown} from 'react-icons/hi';
import ScrollLink from '../ScrollLink';

const HeroSection: React.FC = () => {
  return (
    <section id="home">
      <div className="flex flex-col text-center items-center justify-center animate-fadeIn animation-delay-2 my-10 py-16 sm:py-32 md:py-48 md:flex-row md:space-x-4 md:text-left">
        <div className="md:mt-2 md:w-1/2">
          <Image
            src="/headshot.png"
            alt="Lorenzo's Headshot"
            width={325}
            height={325}
            className="rounded-full shadow-2xl"
          />
        </div>
        <div className="md:mt-2 md:w-3/5">
          <h1 className="text-4xl font-bold mt-6 md:mt-0 md:text-7xl">Hi, I&#39;m Lorenzo!</h1>
          <p className="text-lg mt-4 mb-6 md:text-2xl">
            I&#39;m a <span className="font-semibold text-blue-600">Data Science Student </span>
            based in Los Angeles, CA. Working on automating my life
          </p>
          <ScrollLink
            to="projects"
            className="text-neutral-100 font-semibold px-6 py-3 bg-blue-600 rounded shadow hover:bg-blue-700">
            Projects
          </ScrollLink>
        </div>
      </div>
      <div className="flex flex-row items-center text-center justify-center">
        <ScrollLink to="about" className="">
          <HiArrowDown size={35} className="animate-bounce" />
        </ScrollLink>
      </div>
    </section>
  );
};

export default HeroSection;
