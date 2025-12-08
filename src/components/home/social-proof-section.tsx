"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Star, GitFork, Code, Users, Quote } from "lucide-react";
import { logError } from "@/lib/logger";

interface GitHubStats {
  totalStars: number;
  totalForks: number;
  publicRepos: number;
  followers: number;
}

const testimonials = [
  {
    quote: "Lorenzo&apos;s RAG implementation transformed how our team interacts with documentation. The AI chat feature he built has saved us countless hours.",
    author: "Tech Lead",
    company: "AI Startup",
    avatar: "TL",
  },
  {
    quote: "Working with Lorenzo was a great experience. He took our vague idea and turned it into a polished, production-ready application.",
    author: "Product Manager",
    company: "Data Analytics Co.",
    avatar: "PM",
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

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, isInView]);

  return (
    <span ref={ref}>
      {displayValue.toLocaleString()}{suffix}
    </span>
  );
}

export function SocialProofSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [stats, setStats] = useState<GitHubStats>({
    totalStars: 50,
    totalForks: 25,
    publicRepos: 30,
    followers: 100,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/github/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        logError('Failed to fetch GitHub stats', error, { component: 'SocialProofSection' });
      }
    }
    fetchStats();
  }, []);

  const statItems = [
    { icon: Star, value: stats.totalStars, label: "GitHub Stars", color: "text-yellow-500" },
    { icon: GitFork, value: stats.totalForks, label: "Forks", color: "text-blue-500" },
    { icon: Code, value: stats.publicRepos, label: "Open Source Projects", color: "text-green-500" },
    { icon: Users, value: stats.followers, label: "Followers", color: "text-purple-500" },
  ];

  return (
    <section ref={ref} className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* GitHub Stats */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
        >
          {statItems.map((stat) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              className="text-center p-6 bg-secondary/30 rounded-2xl"
            >
              <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
              <div className="text-3xl md:text-4xl font-bold mb-1">
                <AnimatedNumber value={stat.value} suffix="+" />
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mb-12"
        >
          <span className="text-primary text-sm font-medium uppercase tracking-wider">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2">
            What People Say
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="relative bg-secondary/30 rounded-2xl p-8"
            >
              <Quote className="absolute top-6 right-6 w-10 h-10 text-primary/10" />

              <p className="text-lg text-foreground/90 mb-6 leading-relaxed italic">
                &ldquo;{testimonial.quote.replace(/&apos;/g, "'")}&rdquo;
              </p>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-medium">{testimonial.author}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.company}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
