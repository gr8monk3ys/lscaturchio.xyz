import { twMerge } from "tailwind-merge";
import React from "react";

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";

const defaultSizeByTag: Record<HeadingTag, string> = {
  h1: "text-page-title",
  h2: "text-section-title",
  h3: "text-card-title",
  h4: "text-subsection",
  h5: "text-subsection",
  h6: "text-subsection",
  p: "text-body",
  span: "",
  div: "",
};

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
        // Use the site display font by default; keep sizing flexible via caller.
        "font-display tracking-tight text-foreground",
        defaultSizeByTag[Component],
        className
      )}
    >
      {children}
    </Component>
  );
};
