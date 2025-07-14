"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { FallbackImage } from "@/components/ui/fallback-image";

interface BlogCardProps {
  slug: string;
  title: string;
  description: string;
  date: string;
  image: string;
  tags: string[];
}

const cardVariants = {
  hidden: { 
    opacity: 0,
    y: 20
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  },
  hover: {
    y: -10,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  }
};

export function BlogCard({ slug, title, description, date, image, tags }: BlogCardProps) {
  return (
    <Link href={`/blog/${slug}`}>
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
      >
        <Card className="flex flex-col h-full overflow-hidden group cursor-pointer rounded-lg shadow-[2px_2px_5px_rgba(0,0,0,0.05),-2px_-2px_5px_rgba(255,255,255,0.7)] dark:shadow-[2px_2px_5px_rgba(0,0,0,0.2),-1px_-1px_3px_rgba(255,255,255,0.05)] hover:shadow-[3px_3px_7px_rgba(0,0,0,0.07),-3px_-3px_7px_rgba(255,255,255,0.8)] dark:hover:shadow-[3px_3px_7px_rgba(0,0,0,0.3),-2px_-2px_5px_rgba(255,255,255,0.06)] transition-all duration-300 bg-stone-50 dark:bg-stone-800 border-0">
          <div className="relative w-full h-48">
            <FallbackImage
              src={image}
              alt={title}
              fill
              priority
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <CardHeader>
            <div className="flex gap-2 flex-wrap">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 shadow-[1px_1px_1px_rgba(0,0,0,0.05),-1px_-1px_1px_rgba(255,255,255,0.6)] dark:shadow-[1px_1px_1px_rgba(0,0,0,0.2),-0.5px_-0.5px_0.5px_rgba(255,255,255,0.02)]">
                  {tag}
                </Badge>
              ))}
            </div>
            <CardTitle className="line-clamp-2 font-space-mono text-stone-800 dark:text-stone-100">{title}</CardTitle>
            <CardDescription>{new Date(date).toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-stone-600 dark:text-stone-400 line-clamp-3">{description}</p>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}
