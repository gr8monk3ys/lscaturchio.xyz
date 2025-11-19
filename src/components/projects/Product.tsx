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
          alt={`${product.title} project screenshot`}
          layout="fill"
          objectFit="contain"
          className="rounded-lg"
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
              alt={`${product.title} thumbnail ${idx + 1}`}
              width={60}
              height={60}
              className="object-cover rounded-lg border border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary transition-colors"
            />
          </button>
        ))}
      </div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-8">
        <Heading className="font-bold text-2xl mb-2">{product.title}</Heading>
        <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
          {product.stack?.map((stack: string) => (
            <span
              key={stack}
              className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground"
            >
              {stack}
            </span>
          ))}
        </div>
      </div>
      <Paragraph className="mt-4">{product.description}</Paragraph>
      <div className="prose prose-sm md:prose-base max-w-none text-neutral-600 mt-6">
        {product?.content}
      </div>
      <a
        href={product.href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full mt-6 hover:bg-primary/90 transition-colors"
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
