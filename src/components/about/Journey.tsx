"use client";

import { motion } from '@/lib/motion';
import { SectionHeading } from "@/components/ui/section-heading";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export function AboutJourney() {
  return (
    <section className="w-full px-4 md:px-6 py-12 lg:py-24">
      <div className="w-full max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <SectionHeading>Philosophy & Learning</SectionHeading>
          <motion.div
            variants={itemVariants}
            className="space-y-4 text-lg w-full"
          >
            <motion.p variants={itemVariants}>
              I would like to say that I fall under the camp of absurdism. Authors like Camus, Nietzsche,
              and Carl Jung have profoundly influenced my worldview. The Red Book, in particular, reshaped
              how I think about the human psyche and self-exploration. I believe in the importance of
              understanding the human condition, particularly our ability to understand morality and
              objective reality.
            </motion.p>
            <motion.p variants={itemVariants}>
              Between 2023 and present day, I&apos;ve found myself obsessively watching movies and falling
              in love with various plots, cinematography, and method acting. This, along with reading, has
              become my primary catalyst for introspection and philosophical growth. I&apos;m a big fan of
              Richard Feynman&apos;s style of explaining complex topics in the simplest form - it&apos;s the
              best way to truly understand something.
            </motion.p>
            <motion.p variants={itemVariants}>
              My goal with technology is to create solutions that make data science problems into open-source,
              user-friendly applications. I particularly enjoy the intersection of nature and technology -
              the idea that both are inverse relationships of each other, yet they can work synonymously.
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
