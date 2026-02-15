"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { Badge } from "./badge";
import { Product } from "@/types/products";

export const ExpandableCard = ({ product }: { product: Product }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      layout
      className="group relative w-full bg-secondary/50 rounded-xl overflow-hidden flex flex-col h-full"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        layout
        className="relative aspect-square w-full overflow-hidden"
      >
        <Image
          src={product.thumbnail}
          alt={product.title}
          fill
          className="object-contain p-2 transform group-hover:scale-105 transition-transform duration-300"
          placeholder="blur"
        />
      </motion.div>

      <motion.div layout className="p-4 flex flex-col flex-grow">
        <motion.div layout className="flex flex-col gap-3 h-full">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold tracking-tight">
                {product.title}
              </h3>
              <p className="text-muted-foreground text-sm line-clamp-2">
                {product.description}
              </p>
            </div>
            <Link
              href={product.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visit ${product.title}`}
              className="shrink-0 size-8 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              <ArrowUpRight className="size-4" />
            </Link>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-auto pt-3">
            {product.stack?.map((tech) => (
              <Badge
                key={tech}
                variant="secondary"
                className="px-2 py-0.5 text-xs font-medium"
              >
                {tech}
              </Badge>
            ))}
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mt-2"
          >
            <span>{isExpanded ? "Show less" : "Learn more"}</span>
            <ChevronDown
              className={`size-4 transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="prose prose-sm prose-neutral dark:prose-invert pt-2">
                  {product.content}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
