"use client";

import { motion } from "framer-motion";
import { 
  BrainCircuit, 
  Code2, 
  Database, 
  FileJson, 
  Laptop, 
  LineChart,
  Layers,
  Cpu,
  Cloud,
  Boxes
} from "lucide-react";

const technologies = [
  {
    name: "Machine Learning",
    icon: BrainCircuit,
    description: "TensorFlow, PyTorch, scikit-learn"
  },
  {
    name: "Full Stack",
    icon: Laptop,
    description: "React, Next.js, Node.js"
  },
  {
    name: "Data Science",
    icon: LineChart,
    description: "Python, R, Data Analysis"
  },
  {
    name: "Backend",
    icon: Database,
    description: "PostgreSQL, MongoDB, Redis"
  },
  {
    name: "APIs",
    icon: FileJson,
    description: "REST, GraphQL, WebSockets"
  },
  {
    name: "DevOps",
    icon: Cloud,
    description: "Docker, AWS, CI/CD"
  },
  {
    name: "Languages",
    icon: Code2,
    description: "Python, TypeScript, SQL"
  },
  {
    name: "Architecture",
    icon: Layers,
    description: "Microservices, System Design"
  },
  {
    name: "Hardware",
    icon: Cpu,
    description: "Raspberry Pi, Arduino"
  },
  {
    name: "Tools",
    icon: Boxes,
    description: "Git, Linux, VS Code"
  }
];

export function TechStack() {
  return (
    <div className="mt-16">
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-xl font-semibold text-zinc-800 dark:text-zinc-100"
      >
        Technical Skills
      </motion.h3>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {technologies.map((tech, index) => (
          <motion.div
            key={tech.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            className="group relative overflow-hidden rounded-2xl bg-zinc-50 p-6 transition-colors hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-700/50"
          >
            <div className="relative z-10">
              <tech.icon className="h-8 w-8 text-primary" />
              <h4 className="mt-4 text-base font-medium text-zinc-900 dark:text-zinc-100">
                {tech.name}
              </h4>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {tech.description}
              </p>
            </div>
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
