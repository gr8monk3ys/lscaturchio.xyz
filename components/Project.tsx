'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {BsGithub, BsArrowUpRightSquare} from 'react-icons/bs';
import SlideUp from './SlideUp';

const Project: React.FC<{project: any}> = ({project}) => {
  return (
    <SlideUp offset="-300px 0px -300px 0px">
      <div className="relative group w-64 h-64 m-4">
        <Image
          src={project.image}
          alt=""
          layout="fill"
          objectFit="cover"
          className="rounded-xl shadow-xl hover:opacity-70 transition-opacity duration-300 z-10"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex flex-col items-center justify-center text-white space-y-4 z-20">
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-sm px-4">{project.description}</p>
          <div className="flex space-x-4">
            <Link href={project.github}>
              <BsGithub size={30} className="hover:-translate-y-1 transition-transform cursor-pointer" />
            </Link>
            <Link href={project.link}>
              <BsArrowUpRightSquare size={30} className="hover:-translate-y-1 transition-transform cursor-pointer" />
            </Link>
          </div>
        </div>
      </div>
    </SlideUp>
  );
};

export default Project;
