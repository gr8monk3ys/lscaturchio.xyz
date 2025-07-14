"use client";

// Rule: TypeScript Usage - Use TypeScript for all code with explicit return types
import { ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Rule: TypeScript Usage - Prefer interfaces over types
interface HeroButtonProps {
  href: string;
  variant?: "primary" | "secondary" | "outline";
  children: ReactNode;
  icon?: ReactNode;
  isExternal?: boolean;
  className?: string;
}

function HeroButton({
  href,
  variant = "primary",
  children,
  icon = <ArrowRight className="h-4 w-4" />,
  isExternal = false,
  className,
}: HeroButtonProps): JSX.Element {
  const buttonClasses = cn(
    "inline-flex items-center gap-2 rounded-lg px-5 py-3 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2",
    variant === "primary" && "bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary border-2 border-black dark:border-white",
    variant === "secondary" && "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-secondary",
    variant === "outline" && "border-2 border-black dark:border-white text-primary hover:bg-primary/10 focus:ring-primary",
    className
  );

  const content = (
    <>
      <span>{children}</span>
      {icon && (
        <motion.span
          initial={{ x: 0 }}
          whileHover={{ x: 4 }}
          className="inline-flex"
        >
          {isExternal ? <ExternalLink className="h-4 w-4" /> : icon}
        </motion.span>
      )}
    </>
  );

  if (isExternal) {
    return (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer" 
        className={buttonClasses}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={buttonClasses}>
      {content}
    </Link>
  );
}

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  description?: string;
  align?: "left" | "center" | "right";
  primaryButtonText?: string;
  primaryButtonHref?: string;
  secondaryButtonText?: string;
  secondaryButtonHref?: string;
  children?: ReactNode;
  className?: string;
  backgroundEffect?: "none" | "gradient" | "dots" | "waves";
  titleHighlight?: string | string[];
}

// Rule: UI and Styling - Use Tailwind CSS for styling
export function HeroSection({
  title,
  subtitle,
  description,
  align = "center",
  primaryButtonText,
  primaryButtonHref = "/",
  secondaryButtonText,
  secondaryButtonHref = "/",
  children,
  className,
  backgroundEffect = "gradient",
  titleHighlight,
}: HeroSectionProps): JSX.Element {
  // Process title with highlights if needed
  let processedTitle: ReactNode = title;
  if (titleHighlight) {
    const highlights = Array.isArray(titleHighlight) ? titleHighlight : [titleHighlight];
    
    // Start with the title string, but build up ReactNode elements for highlighted parts
    let parts: ReactNode[] | string = title;
    
    highlights.forEach(highlight => {
      const regex = new RegExp(`(${highlight})`, 'gi');
      if (typeof parts === 'string') {
        parts = parts.split(regex).map((part, i) => {
          if (part.toLowerCase() === highlight.toLowerCase()) {
            return (
              <span 
                key={i} 
                className="relative inline-block"
              >
                <span className="relative z-10">{part}</span>
                <span className="absolute bottom-1 left-0 z-0 h-3 w-full bg-primary"></span>
              </span>
            );
          }
          return part;
        });
      }
    });
    
    processedTitle = parts;
  }

  const textAlignClass = cn(
    align === "left" && "text-left",
    align === "center" && "text-center",
    align === "right" && "text-right"
  );

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 100,
        damping: 15 
      },
    },
  };

  const backgroundStyles = cn(
    backgroundEffect === "gradient" && "bg-gradient-to-b from-background to-background/50",
    backgroundEffect === "dots" && "bg-dots",
    backgroundEffect === "waves" && "bg-waves"
  );

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={cn(
        "relative overflow-hidden py-16 md:py-24",
        backgroundStyles,
        className
      )}
    >
      {/* Background decorative elements */}
      {backgroundEffect === "gradient" && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 top-0 h-96 w-96 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl"></div>
          <div className="absolute -right-32 bottom-0 h-96 w-96 translate-y-1/2 rounded-full bg-primary/10 blur-3xl"></div>
        </div>
      )}

      <div className={cn("container relative z-10 mx-auto px-4 sm:px-6 lg:px-8", textAlignClass)}>
        {subtitle && (
          <motion.div
            variants={itemVariants}
            className="mb-4"
          >
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              {subtitle}
            </span>
          </motion.div>
        )}

        <motion.h1 
          variants={itemVariants}
          className="text-foreground mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
        >
          {processedTitle}
        </motion.h1>

        {description && (
          <motion.p 
            variants={itemVariants}
            className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground"
          >
            {description}
          </motion.p>
        )}

        {(primaryButtonText || secondaryButtonText) && (
          <motion.div 
            variants={itemVariants}
            className={cn(
              "flex flex-wrap gap-4",
              align === "center" && "justify-center",
              align === "right" && "justify-end"
            )}
          >
            {primaryButtonText && (
              <HeroButton href={primaryButtonHref} variant="primary">
                {primaryButtonText}
              </HeroButton>
            )}
            
            {secondaryButtonText && (
              <HeroButton href={secondaryButtonHref} variant="outline">
                {secondaryButtonText}
              </HeroButton>
            )}
          </motion.div>
        )}

        {children && (
          <motion.div 
            variants={itemVariants}
            className="mt-12"
          >
            {children}
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}
