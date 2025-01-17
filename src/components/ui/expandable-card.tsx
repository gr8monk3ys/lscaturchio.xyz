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
      className="group relative w-full bg-secondary/50 rounded-xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        layout
        className="relative aspect-[2/1] md:aspect-[3/1] w-full overflow-hidden"
      >
        <Image
          src={product.thumbnail}
          alt={product.title}
          className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-300"
          placeholder="blur"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-background/0" />
      </motion.div>

      <motion.div layout className="p-6">
        <motion.div layout className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-xl font-semibold tracking-tight">
                {product.title}
              </h3>
              <p className="text-muted-foreground line-clamp-2">
                {product.description}
              </p>
            </div>
            <Link
              href={product.href}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 size-10 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              <ArrowUpRight className="size-5" />
            </Link>
          </div>

          <div className="flex flex-wrap gap-2">
            {product.stack?.map((tech) => (
              <Badge key={tech} variant="secondary">
                {tech}
              </Badge>
            ))}
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-4 pt-4">
                  {product.images.slice(1).map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-video overflow-hidden rounded-lg"
                    >
                      <Image
                        src={image}
                        alt={`${product.title} screenshot ${index + 2}`}
                        className="object-cover"
                        fill
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
