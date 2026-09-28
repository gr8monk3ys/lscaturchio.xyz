"use client";
import {
  useScroll,
  useTransform,
  m,
} from '@/lib/motion';
import React, { useRef } from "react";
import { timeline } from "@/constants/timeline";

export const WorkTimeline = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div
      className="w-full bg-background font-sans"
      ref={containerRef}
    >
      <div className="relative max-w-6xl mx-auto pb-20">
        {timeline.map((item) => (
          <div
            key={`${item.company}-${item.title}-${item.date}`}
            className="flex justify-start pt-10 md:pt-40 md:gap-10"
          >
            <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
              <div className="h-10 absolute left-3 md:left-3 w-10 rounded-full bg-background border border-border flex items-center justify-center">
                <div className="h-2.5 w-2.5 rounded-full bg-primary" />
              </div>
              <h3 className="hidden md:block md:pl-20 text-card-title text-muted-foreground">
                {item.company}
              </h3>
            </div>

            <div className="relative pl-20 pr-4 md:pl-4 w-full">
              {/* `text-card-title`, matching the desktop copy of this same
                  heading four lines up. It was `text-section-title` here and
                  `text-card-title` there — one heading rendered at two ramp
                  steps across a breakpoint, 34.56px on a phone and 20px on a
                  laptop, against the Fluid Heading Rule. Both classes are
                  legitimate ramp tokens, which is why `heading-ramp` and
                  `display-scale-outside-ramp` could not see it: the rules check
                  that a heading uses the ramp, not that it picks one step and
                  keeps it. A company name is a card title at every width. */}
              <h3 className="md:hidden block text-card-title mb-4 text-left text-muted-foreground">
                {item.company}
              </h3>
              <div className="space-y-4">
                <div className="text-lg font-semibold text-foreground">
                  {item.title}
                </div>
                <div className="label-mono">
                  {item.date}
                </div>
                <div className="text-sm text-foreground/80">
                  {item.description}
                </div>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                  {item.responsibilities.map((responsibility) => (
                    <li key={responsibility}>
                      {responsibility}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
        {/* The track spans its container with `top-0 bottom-0` rather than a
            height measured once with getBoundingClientRect (which also went
            stale on resize), and the progress line grows with `scaleY`, not
            `height`, so the scroll-linked motion stays on the compositor. */}
        <div
          className="absolute md:left-8 left-8 top-0 bottom-0 overflow-hidden w-[2px] bg-border mask-[linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
        >
          <m.div
            style={{
              scaleY: scrollYProgress,
              opacity: opacityTransform,
            }}
            className="absolute inset-0 w-[2px] origin-top bg-primary rounded-full"
          />
        </div>
      </div>
    </div>
  );
};
