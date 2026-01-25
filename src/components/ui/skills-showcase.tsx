"use client";

import { motion, useInView } from "framer-motion";
import { Badge } from "./badge";
import { Brain, Code2, Database, GitBranch, LineChart, Network } from "lucide-react";
import { useRef } from "react";

const skills = [
  {
    category: "Data Science",
    icon: Brain,
    skills: ["Python", "PyTorch", "TensorFlow", "Scikit-learn", "Pandas", "NumPy"]
  },
  {
    category: "Machine Learning",
    icon: Network,
    skills: ["Deep Learning", "NLP", "Computer Vision", "Reinforcement Learning", "MLOps"]
  },
  {
    category: "Data Engineering",
    icon: Database,
    skills: ["SQL", "Spark", "Airflow", "Kafka", "Docker", "Kubernetes"]
  },
  {
    category: "Development",
    icon: Code2,
    skills: ["TypeScript", "React", "Next.js", "Node.js", "FastAPI", "GraphQL"]
  },
  {
    category: "Analytics",
    icon: LineChart,
    skills: ["Tableau", "Power BI", "Data Visualization", "Statistical Analysis", "A/B Testing"]
  },
  {
    category: "Tools & Practices",
    icon: GitBranch,
    skills: ["Git", "CI/CD", "Agile", "AWS", "GCP", "Azure"]
  }
];

export function SkillsShowcase() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95
    },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15
      }
    }
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    show: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 20
      }
    }
  };

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    show: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 150,
        damping: 15
      }
    }
  };

  return (
    <section className="w-full px-4 md:px-6 py-12 lg:py-24 bg-secondary/20">
      <div className="w-full max-w-7xl mx-auto" ref={containerRef}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          className="flex flex-col gap-10"
        >
          <motion.div variants={itemVariants} className="flex gap-4 flex-col items-start">
            <Badge variant="secondary">Skills & Expertise</Badge>
            <div className="flex gap-2 flex-col">
              <h2 className="text-3xl md:text-5xl tracking-tighter font-bold">
                Technical Proficiencies
              </h2>
              <p className="text-lg text-muted-foreground max-w-prose">
                What I work with and what I know well.
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map((category, index) => (
              <motion.div
                key={category.category}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.02,
                  transition: { type: "spring", stiffness: 300 }
                }}
                className="bg-background/50 backdrop-blur-sm rounded-xl p-6 border border-primary/10 group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <motion.div 
                    variants={iconVariants}
                    className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors"
                  >
                    <category.icon className="h-5 w-5 text-primary" />
                  </motion.div>
                  <h3 className="text-lg font-semibold">{category.category}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill) => (
                    <motion.div
                      key={skill}
                      variants={badgeVariants}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Badge
                        variant="secondary"
                        className="hover:bg-primary/20 transition-colors cursor-default"
                      >
                        {skill}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
