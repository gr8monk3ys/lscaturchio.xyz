"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export function DynamicBackground() {
  return (
    <div className="fixed inset-0 -z-10 h-full w-full overflow-hidden">
      <div className="relative h-full w-full bg-white dark:bg-zinc-900">
        {/* Primary gradient orb - Blue/Purple */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -left-1/4 -top-1/4 h-[800px] w-[800px] rounded-full bg-gradient-to-br from-blue-500/30 via-indigo-400/30 to-purple-500/30 blur-[120px]"
        />

        {/* Secondary gradient orb - Cyan/Blue */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.25, 0.35, 0.25],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute -bottom-1/4 -right-1/4 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-cyan-400/30 via-sky-400/30 to-blue-500/30 blur-[120px]"
        />

        {/* Accent gradient orb - Purple/Pink */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-violet-400/30 via-purple-400/30 to-fuchsia-500/30 blur-[120px]"
        />

        {/* Noise texture overlay */}
        <div className="absolute inset-0 bg-noise opacity-[0.15] mix-blend-soft-light" />

        {/* Gradient overlay for better content contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
      </div>
    </div>
  );
}
