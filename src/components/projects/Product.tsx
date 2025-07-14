"use client";
import { Product } from "@/types/products";
import Image, { StaticImageData } from "next/image";
import React, { useState } from "react";
import { Heading } from "../Heading";
import { Paragraph } from "../Paragraph";
import Link from "next/link";
import { motion } from "framer-motion";

export const SingleProduct = ({ product }: { product: Product }) => {
  const [activeImage, setActiveImage] = useState<StaticImageData | string>(
    product.thumbnail
  );
  return (
    <div className="py-10 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        key={product.slug}
        className="relative aspect-video"
      >
        <Image
          src={activeImage}
          alt="thumbnail"
          layout="fill"
          objectFit="contain"
          className="rounded-lg shadow-[2px_2px_4px_rgba(0,0,0,0.1),-2px_-2px_4px_rgba(255,255,255,0.7)] dark:shadow-[2px_2px_4px_rgba(0,0,0,0.3),-1px_-1px_3px_rgba(255,255,255,0.05)]"
        />
      </motion.div>
      <div className="flex flex-row justify-center my-4 flex-wrap">
        {product.images.map((image, idx) => (
          <button
            onClick={() => setActiveImage(image)}
            key={`image-thumbnail-${idx}`}
            className="m-1"
          >
            <Image
              src={image}
              alt="product thumbnail"
              width={60}
              height={60}
              className="object-cover rounded-lg shadow-[1px_1px_2px_rgba(0,0,0,0.05),-1px_-1px_2px_rgba(255,255,255,0.6)] dark:shadow-[1px_1px_2px_rgba(0,0,0,0.2),-0.5px_-0.5px_1px_rgba(255,255,255,0.03)] hover:shadow-[2px_2px_4px_rgba(0,0,0,0.1),-2px_-2px_4px_rgba(255,255,255,0.7)] dark:hover:shadow-[2px_2px_4px_rgba(0,0,0,0.3),-1px_-1px_3px_rgba(255,255,255,0.05)] transition-all"
            />
          </button>
        ))}
      </div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-8">
        <Heading className="font-bold text-2xl mb-2 font-space-mono">{product.title}</Heading>
        <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
          {product.stack?.map((stack: string) => (
            <div
              key={`chip-${stack}`}
              className="bg-stone-100 dark:bg-stone-700 px-3 py-2 text-xs font-space-mono text-stone-700 dark:text-stone-300 rounded-lg shadow-[1px_1px_2px_rgba(0,0,0,0.05),-1px_-1px_2px_rgba(255,255,255,0.6)] dark:shadow-[1px_1px_2px_rgba(0,0,0,0.2),-0.5px_-0.5px_1px_rgba(255,255,255,0.03)]"
            >
              {stack}
            </div>
          ))}
        </div>
      </div>
      <Paragraph className="text-stone-600 dark:text-stone-300 font-space-mono leading-relaxed">
        {product.description}
      </Paragraph>
      <div className="prose prose-sm md:prose-base max-w-none text-neutral-600 mt-6">
        {product?.content}
      </div>
      <a
        href={product.href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 font-space-mono bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 px-4 py-2 rounded-lg mt-6 shadow-[2px_2px_4px_rgba(0,0,0,0.1),-2px_-2px_4px_rgba(255,255,255,0.7)] dark:shadow-[2px_2px_4px_rgba(0,0,0,0.3),-1px_-1px_3px_rgba(255,255,255,0.05)] hover:shadow-[1px_1px_2px_rgba(0,0,0,0.05),-1px_-1px_2px_rgba(255,255,255,0.6)] dark:hover:shadow-[1px_1px_2px_rgba(0,0,0,0.2),-0.5px_-0.5px_1px_rgba(255,255,255,0.03)] transform transition-all"
      >
        Live Preview
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14m-7-7l7 7-7 7" />
        </svg>
      </a>
    </div>
  );
};
