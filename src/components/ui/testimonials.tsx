"use client";

import { motion } from "framer-motion";
import { Badge } from "./badge";
import { Quote } from "lucide-react";
import Image from "next/image";

const testimonials = [
  {
    quote: "Lorenzo&apos;s expertise in data science and machine learning helped us develop innovative solutions that significantly improved our business outcomes.",
    author: "Sarah Chen",
    title: "CTO, TechVision AI",
    image: "/images/testimonial-1.jpg"
  },
  {
    quote: "Working with Lorenzo was a game-changer for our team. His ability to bridge the gap between complex data problems and practical solutions is remarkable.",
    author: "Michael Rodriguez",
    title: "Lead Data Scientist, DataCorp",
    image: "/images/testimonial-2.jpg"
  },
  {
    quote: "Not only is Lorenzo technically proficient, but his creative approach to problem-solving brings a unique perspective to every project.",
    author: "Emily Thompson",
    title: "Product Manager, InnovateLabs",
    image: "/images/testimonial-3.jpg"
  }
];

export function Testimonials() {
  return (
    <section className="w-full px-4 md:px-6 py-12 lg:py-24">
      <div className="w-full max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col gap-10"
        >
          <div className="flex gap-4 flex-col items-start">
            <Badge variant="secondary">Testimonials</Badge>
            <div className="flex gap-2 flex-col">
              <h2 className="text-3xl md:text-5xl tracking-tighter font-bold">
                What People Say
              </h2>
              <p className="text-lg text-muted-foreground max-w-prose">
                Feedback from colleagues and clients I&apos;ve had the pleasure to work with.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.author}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative bg-secondary/50 rounded-xl p-6"
              >
                <Quote className="absolute top-6 right-6 h-8 w-8 text-primary/20" />
                <div className="flex flex-col gap-6">
                  <p className="text-muted-foreground italic relative">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-secondary">
                      <Image
                        src={testimonial.image}
                        alt={testimonial.author}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.author}</div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.title}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
