"use client";

import { motion } from "framer-motion";
import { Download } from "lucide-react";

interface DownloadButtonProps {
  href: string;
  text?: string;
}

export function DownloadButton({ href, text = "Download Resume" }: DownloadButtonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex justify-center mt-16"
    >
      <motion.a
        href={href}
        download
        className="group relative inline-flex items-center justify-center gap-3 rounded-lg border border-zinc-200 bg-white/50 px-6 py-3 text-base font-medium text-zinc-900 backdrop-blur-sm transition-all hover:border-zinc-300 hover:bg-white/80 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100 dark:hover:border-zinc-700 dark:hover:bg-zinc-900/80"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="relative">
          {text}
        </span>
        <Download className="h-5 w-5 transition-transform group-hover:translate-y-0.5" />
      </motion.a>
    </motion.div>
  );
}
