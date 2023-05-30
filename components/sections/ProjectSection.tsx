'use client';
import React from 'react';
import Project from '../Project';

const projects = [
  {
    name: 'Paper-Summarizer',
    description:
      'ThankfulThoughts is a web app that generates an appreciative sentence of something or someone you are thankful for.',
    image: '/sample.png',
    github: 'https://github.com/gr8monk3ys/Paper-Summarizer',
    link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstley',
  },
  {
    name: 'Eyebook-Reader',
    description: 'PlatoIO is a to do list app that built using the PERN stack.',
    image: '/sample.png',
    github: 'https://github.com/gr8monk3ys/Eyebook-Reader',
    link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstley',
  },
  {
    name: 'Chess AI',
    description: 'Kator Family Photos is a photos and video digitization service in the LA area.',
    image: '/sample.png',
    github: 'https://github.com/gr8monk3ys/chessAI',
    link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstley',
  },
];

const ProjectsSection: React.FC = () => {
  return (
    <section id="projects">
      <h1 className="my-10 text-center font-bold text-4xl">
        Projects
        <hr className="w-6 h-1 mx-auto my-4 bg-blue-500 border-0 rounded"></hr>
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {projects.map((project, idx) => (
          <Project key={idx} project={project} />
        ))}
      </div>
    </section>
  );
};

export default ProjectsSection;
