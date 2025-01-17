"use client";

import { motion, useScroll, useTransform } from "framer-motion";

export const DynamicBackground = () => {
  const { scrollYProgress } = useScroll();
  const backgroundColor = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [
      "radial-gradient(circle at top left, hsl(142 76% 97%), transparent), linear-gradient(135deg, hsl(142 50% 96%), hsl(142 30% 99%))",
      "radial-gradient(circle at center, hsl(142 76% 96%), transparent), linear-gradient(180deg, hsl(142 50% 97%), hsl(142 30% 98%))",
      "radial-gradient(circle at bottom right, hsl(142 76% 97%), transparent), linear-gradient(225deg, hsl(142 50% 96%), hsl(142 30% 99%))",
    ]
  );

  const meshGradient = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [
      "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E\")",
      "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E\")",
      "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E\")",
    ]
  );

  return (
    <motion.div
      className="fixed inset-0 -z-50 transition-all duration-1000 ease-out"
      style={{ 
        background: backgroundColor,
        backgroundBlendMode: "overlay",
        backgroundImage: meshGradient
      }}
    />
  );
};
