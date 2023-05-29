import {useState} from 'react';
import dynamic from 'next/dynamic';
import HeroSection from '../components/sections/HeroSection';
import AboutSection from '../components/sections/AboutSection';
import ProjectsSection from '../components/sections/ProjectSection';
import PostSection from '../components/sections/PostSection';
import getPostMetadata from '../components/getPostMetadata';

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 md:max-w-5xl ">
      <HeroSection />
      <AboutSection />
      <PostSection />
      <ProjectsSection />
    </main>
  );
}
