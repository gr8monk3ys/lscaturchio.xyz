"use client";

import React from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  MotionValue,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { products } from "@/constants/products";

export function Feature() {
  const firstRow = products.slice(0, 2);
  const secondRow = products.slice(2, 4);
  const thirdRow = products.slice(4, 5);
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const springConfig = { stiffness: 300, damping: 30, bounce: 100 };

  const translateX = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, 1000]),
    springConfig
  );
  const translateXReverse = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, -1000]),
    springConfig
  );
  const rotateX = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [15, 0]),
    springConfig
  );
  const opacity = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [0.2, 1]),
    springConfig
  );
  const rotateZ = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [20, 0]),
    springConfig
  );
  const translateY = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [-700, 500]),
    springConfig
  );

  return (
    <div
      ref={ref}
      className="h-[300vh] py-40 overflow-hidden antialiased relative flex flex-col self-auto [perspective:1000px] [transform-style:preserve-3d]"
    >
      <div className="max-w-7xl relative mx-auto py-20 md:py-40 px-4 w-full left-0 top-0">
        <h2 className="text-2xl md:text-7xl font-bold dark:text-white">
          Featured <br /> Projects
        </h2>
        <p className="max-w-2xl text-base md:text-xl mt-8 dark:text-neutral-200">
          A showcase of my work in AI, web development, and software engineering.
        </p>
      </div>

      <motion.div
        style={{
          rotateX,
          rotateZ,
          translateY,
          opacity,
        }}
      >
        <motion.div className="flex flex-row-reverse space-x-reverse space-x-20 mb-20">
          {firstRow.map((project) => (
            <ProjectCard
              project={{
                title: project.title,
                link: project.href,
                thumbnail: project.thumbnail.src,
                description: project.description,
                stack: project.stack,
              }}
              translate={translateX}
              key={project.title}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row mb-20 space-x-20">
          {secondRow.map((project) => (
            <ProjectCard
              project={{
                title: project.title,
                link: project.href,
                thumbnail: project.thumbnail.src,
                description: project.description,
                stack: project.stack,
              }}
              translate={translateXReverse}
              key={project.title}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row-reverse space-x-reverse space-x-20">
          {thirdRow.map((project) => (
            <ProjectCard
              project={{
                title: project.title,
                link: project.href,
                thumbnail: project.thumbnail.src,
                description: project.description,
                stack: project.stack,
              }}
              translate={translateX}
              key={project.title}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}

const ProjectCard = ({
  project,
  translate,
}: {
  project: {
    title: string;
    link: string;
    thumbnail: string;
    description: string;
    stack: string[];
  };
  translate: MotionValue<number>;
}) => {
  return (
    <motion.div
      style={{
        x: translate,
      }}
      whileHover={{
        y: -20,
      }}
      key={project.title}
      className="group/project h-96 w-[30rem] relative flex-shrink-0"
    >
      <Link
        href={project.link}
        className="block group-hover/project:shadow-2xl"
      >
        <Image
          src={project.thumbnail}
          height={600}
          width={600}
          className="object-cover object-center absolute h-full w-full inset-0 rounded-xl"
          alt={project.title}
        />
      </Link>
      <div className="absolute inset-0 h-full w-full opacity-0 group-hover/project:opacity-90 bg-black pointer-events-none rounded-xl transition-opacity duration-300"></div>
      <div className="absolute bottom-6 left-6 right-6 opacity-0 group-hover/project:opacity-100 transition-opacity duration-300">
        <h2 className="text-white text-2xl font-bold mb-2">{project.title}</h2>
        <p className="text-gray-200 text-sm mb-3">{project.description}</p>
        <div className="flex flex-wrap gap-2">
          {project.stack.map((tech) => (
            <span key={tech} className="text-xs bg-white/20 text-white px-2 py-1 rounded">
              {tech}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
