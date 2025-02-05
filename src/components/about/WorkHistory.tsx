"use client";
import { timeline } from "@/constants/timeline";
import React from "react";
import { Paragraph } from "./Paragraph";
import { Heading } from "./Heading";
import {
  IconCheck,
  IconCheckbox,
  IconCircleCheckFilled,
} from "@tabler/icons-react";
import { motion } from "framer-motion";

export const WorkHistory = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {timeline.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative rounded-lg border border-zinc-200/30 bg-zinc-50/30 p-6 backdrop-blur-sm transition-colors dark:border-zinc-800/30 dark:bg-zinc-900/30"
        >
          <div className="flex md:flex-row flex-col space-y-10 md:space-y-0 space-x-10 my-20 relative">
            <Paragraph className="w-40">{item.date}</Paragraph>
            <div>
              <Heading
                as="h5"
                className="text-lg md:text-lg lg:text-lg text-neutral-500"
              >
                {item.company}
              </Heading>
              <Paragraph className="text-base md:text-base lg:text-base font-semibold">
                {item.title}
              </Paragraph>
              <Paragraph className="text-sm md:text-sm lg:text-sm mb-4">
                {item.description}
              </Paragraph>

              {item.responsibilities.map((responsibility, index) => (
                <Step key={responsibility}>{responsibility}</Step>
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

const Step = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex space-x-1 items-start my-2">
      <IconCircleCheckFilled className="h-3 w-4 mt-1 text-slate-200" />
      <Paragraph className="text-sm md:text-sm lg:text-sm">
        {children}
      </Paragraph>
    </div>
  );
};
