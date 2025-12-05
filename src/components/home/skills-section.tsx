"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const skills = [
  {
    category: "AI & Machine Learning",
    items: ["Python", "PyTorch", "TensorFlow", "LangChain", "OpenAI", "RAG Systems", "NLP"],
    color: "from-blue-500 to-cyan-500",
  },
  {
    category: "Data Science",
    items: ["Pandas", "NumPy", "Scikit-learn", "SQL", "Data Visualization", "Statistical Analysis"],
    color: "from-purple-500 to-pink-500",
  },
  {
    category: "Web Development",
    items: ["TypeScript", "React", "Next.js", "Node.js", "Tailwind CSS", "PostgreSQL", "Supabase"],
    color: "from-green-500 to-emerald-500",
  },
  {
    category: "Tools & Infrastructure",
    items: ["Git", "Docker", "AWS", "Vercel", "GitHub Actions", "Linux"],
    color: "from-orange-500 to-yellow-500",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function SkillsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Technologies I Work With
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A curated selection of tools and technologies I use to bring ideas to life
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {skills.map((skill) => (
            <motion.div
              key={skill.category}
              variants={itemVariants}
              className="group relative bg-secondary/30 rounded-2xl p-6 hover:bg-secondary/50 transition-colors overflow-hidden"
            >
              {/* Gradient accent */}
              <div
                className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${skill.color} opacity-0 group-hover:opacity-100 transition-opacity`}
              />

              <h3 className="text-lg font-semibold mb-4">{skill.category}</h3>

              <div className="flex flex-wrap gap-2">
                {skill.items.map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1.5 text-sm bg-background/50 rounded-lg text-muted-foreground group-hover:text-foreground transition-colors"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
