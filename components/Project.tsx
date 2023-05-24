// components/Project.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BsGithub, BsArrowUpRightSquare } from 'react-icons/bs';
import SlideUp from './SlideUp';

const Project: React.FC<{ project: any }> = ({ project }) => {
  return (
    <div>
      <SlideUp offset="-300px 0px -300px 0px">
        <div className="flex flex-col animate-slideUpCubiBezier animation-delay-2 md:flex-row md:space-x-12">
          <div className="md:w-1/2">
            <Link href={project.link}>
              <Image
                src={project.image}
                alt=""
                width={1000}
                height={1000}
                className="rounded-xl shadow-xl hover:opacity-70"
              />
            </Link>
          </div>
          <div className="mt-8 md:w-1/2">
            <h1 className="text-4xl font-bold mb-6">{project.name}</h1>
            <p className="text-xl leading-7 mb-4 text-neutral-600 dark:text-neutral-400">
              {project.description}
            </p>
            <div className="flex flex-row align-bottom space-x-4">
              <Link href={project.github} target="_blank">
                <BsGithub
                  size={30}
                  className="hover:-translate-y-1 transition-transform cursor-pointer"
                />
              </Link>
              <Link href={project.link} target="_blank">
                <BsArrowUpRightSquare
                  size={30}
                  className="hover:-translate-y-1 transition-transform cursor-pointer"
                />
              </Link>
            </div>
          </div>
        </div>
      </SlideUp>
    </div>
  );
};

export default Project;
