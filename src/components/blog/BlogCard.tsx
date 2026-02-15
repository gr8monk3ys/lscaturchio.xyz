"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { FallbackImage } from "@/components/ui/fallback-image";
import { BlogViewCount } from "./blog-view-count";
import { BlogProgressBadge } from "./blog-progress-badge";
import { formatDate } from "@/lib/formatDate";

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
      ease: "easeOut" as const
    }
  },
  hover: {
    y: -10,
    transition: {
      duration: 0.2,
      ease: "easeInOut" as const
    }
  }
};

export function BlogCard({ slug, title, description, date, image, tags }: BlogCardProps) {
  const reduceMotion = useReducedMotion();
  const shared = !reduceMotion;

  return (
    <Link href={`/blog/${slug}`}>
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
      >
        <Card className="flex flex-col h-full overflow-hidden group cursor-pointer">
          <motion.div
            layoutId={shared ? `blog-cover-${slug}` : undefined}
            className="relative w-full h-48 overflow-hidden rounded-t-2xl"
          >
            <FallbackImage
              src={image}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <BlogProgressBadge slug={slug} />
          </motion.div>
          <CardHeader>
            <div className="flex gap-2 flex-wrap">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            <motion.div layoutId={shared ? `blog-title-${slug}` : undefined}>
              <CardTitle className="line-clamp-2">{title}</CardTitle>
            </motion.div>
            <CardDescription className="flex items-center gap-3">
              <time dateTime={date}>{formatDate(date)}</time>
              <BlogViewCount slug={slug} />
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-muted-foreground line-clamp-3">{description}</p>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}
