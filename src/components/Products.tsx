"use client";
import React from "react";
import { Product } from "@/types/products";
import { products } from "@/constants/products";
import { motion } from "framer-motion";
import { ExpandableCard } from "./ui/expandable-card";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const Products = () => {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      className="grid grid-cols-1 gap-8"
    >
      {products.map((product: Product) => (
        <ExpandableCard key={product.href} product={product} />
      ))}
    </motion.div>
  );
};
