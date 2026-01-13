import React from "react";

import localFont from "next/font/local";
import { twMerge } from "tailwind-merge";

// Font files can be colocated inside of `app`
const CalSans = localFont({
  src: [{ path: "../../fonts/CalSans-SemiBold.woff2" }],
  display: "swap",
});

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";

export const Heading = ({
  className,
  children,
  as: Component = "h1",
}: {
  className?: string;
  children: React.ReactNode;
  as?: HeadingTag;
}) => {
  return (
    <Component
      className={twMerge(
        CalSans.className,
        "text-base md:text-xl lg:text-4xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary",
        className
      )}
    >
      {children}
    </Component>
  );
};
