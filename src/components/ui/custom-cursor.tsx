"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorOuterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const cursorOuter = cursorOuterRef.current;
    if (!cursor || !cursorOuter) return;

    const onMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      cursor.style.transform = `translate(${clientX - 4}px, ${clientY - 4}px)`;
      cursorOuter.style.transform = `translate(${clientX - 20}px, ${clientY - 20}px)`;
    };

    const onMouseEnterLink = () => {
      cursor.classList.add("scale-2");
      cursorOuter.classList.add("scale-0");
    };

    const onMouseLeaveLink = () => {
      cursor.classList.remove("scale-2");
      cursorOuter.classList.remove("scale-0");
    };

    document.addEventListener("mousemove", onMouseMove);
    const links = document.querySelectorAll("a, button");
    links.forEach((link) => {
      link.addEventListener("mouseenter", onMouseEnterLink);
      link.addEventListener("mouseleave", onMouseLeaveLink);
    });

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      links.forEach((link) => {
        link.removeEventListener("mouseenter", onMouseEnterLink);
        link.removeEventListener("mouseleave", onMouseLeaveLink);
      });
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed pointer-events-none z-50 h-2 w-2 rounded-full bg-primary mix-blend-difference transition-transform duration-200 ease-out"
      />
      <div
        ref={cursorOuterRef}
        className="fixed pointer-events-none z-50 h-10 w-10 rounded-full border border-primary mix-blend-difference transition-transform duration-300 ease-out"
      />
    </>
  );
};
