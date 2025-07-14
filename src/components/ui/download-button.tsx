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
        className="group relative inline-flex items-center justify-center gap-3 rounded-lg bg-stone-50 dark:bg-stone-800 px-6 py-3 text-base font-medium text-stone-700 dark:text-stone-300 backdrop-blur-sm transition-all shadow-[3px_3px_5px_rgba(0,0,0,0.05),-3px_-3px_5px_rgba(255,255,255,0.8)] dark:shadow-[3px_3px_5px_rgba(0,0,0,0.25),-2px_-2px_5px_rgba(255,255,255,0.03)] hover:shadow-[2px_2px_3px_rgba(0,0,0,0.06),-2px_-2px_3px_rgba(255,255,255,0.9)] dark:hover:shadow-[2px_2px_3px_rgba(0,0,0,0.3),-1px_-1px_2px_rgba(255,255,255,0.05)] hover:translate-y-[-2px] border-0 font-['Space_Mono',monospace]"
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
