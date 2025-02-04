"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion, Variants } from "framer-motion";
import { Send } from "lucide-react";
import React, { useState } from "react";

const defaultFormState = {
  name: {
    value: "",
    error: "",
  },
  email: {
    value: "",
    error: "",
  },
  message: {
    value: "",
    error: "",
  },
};

const containerVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 }
};

const itemVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

export default function Contact() {
  const [formData, setFormData] = useState(defaultFormState);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Write your submit logic here
    console.log(formData);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="relative w-full max-w-2xl mx-auto"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background rounded-2xl" />
        <div className="absolute -right-4 top-0 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
        <div className="absolute -left-4 bottom-0 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 p-6 md:p-8 rounded-2xl bg-background/50 backdrop-blur-sm border">
        <motion.div
          variants={itemVariants}
          className="space-y-2"
        >
          <label htmlFor="name" className="text-base md:text-lg font-medium">
            Name
          </label>
          <Input
            id="name"
            placeholder="Your name"
            className="text-base md:text-lg"
            value={formData.name.value}
            onChange={(e) => {
              setFormData({
                ...formData,
                name: {
                  value: e.target.value,
                  error: "",
                },
              });
            }}
          />
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="space-y-2"
        >
          <label htmlFor="email" className="text-base md:text-lg font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="your.email@example.com"
            className="text-base md:text-lg"
            value={formData.email.value}
            onChange={(e) => {
              setFormData({
                ...formData,
                email: {
                  value: e.target.value,
                  error: "",
                },
              });
            }}
          />
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="space-y-2"
        >
          <label htmlFor="message" className="text-base md:text-lg font-medium">
            Message
          </label>
          <Textarea
            id="message"
            placeholder="Your message..."
            className="text-base md:text-lg min-h-[150px]"
            value={formData.message.value}
            onChange={(e) => {
              setFormData({
                ...formData,
                message: {
                  value: e.target.value,
                  error: "",
                },
              });
            }}
          />
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="pt-2"
        >
          <Button
            type="submit"
            size="lg"
            className="w-full text-base md:text-lg h-12 bg-primary hover:bg-primary/90"
          >
            Send Message
            <Send className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
}
