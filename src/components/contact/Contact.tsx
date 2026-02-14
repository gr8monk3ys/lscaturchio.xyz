"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion, Variants } from "framer-motion";
import { Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
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
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: null, message: "" });

    // Client-side validation
    let hasError = false;
    const newFormData = { ...formData };

    if (!formData.name.value.trim()) {
      newFormData.name.error = "Name is required";
      hasError = true;
    }

    if (!formData.email.value.trim()) {
      newFormData.email.error = "Email is required";
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.value)) {
      newFormData.email.error = "Invalid email format";
      hasError = true;
    }

    if (!formData.message.value.trim()) {
      newFormData.message.error = "Message is required";
      hasError = true;
    }

    if (hasError) {
      setFormData(newFormData);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.value.trim(),
          email: formData.email.value.trim(),
          message: formData.message.value.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus({
          type: "error",
          message: data.error || "Failed to send message. Please try again.",
        });
      } else {
        setStatus({
          type: "success",
          message: data.message || "Message sent successfully!",
        });
        // Reset form on success
        setFormData(defaultFormState);
      }
    } catch {
      setStatus({
        type: "error",
        message: "Network error. Please check your connection and try again.",
      });
    } finally {
      setIsLoading(false);
    }
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
            className={`text-base md:text-lg ${
              formData.name.error ? "border-red-500 focus-visible:ring-red-500" : ""
            }`}
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
            disabled={isLoading}
          />
          {formData.name.error && (
            <p className="text-sm text-red-500">{formData.name.error}</p>
          )}
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
            className={`text-base md:text-lg ${
              formData.email.error ? "border-red-500 focus-visible:ring-red-500" : ""
            }`}
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
            disabled={isLoading}
          />
          {formData.email.error && (
            <p className="text-sm text-red-500">{formData.email.error}</p>
          )}
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
            className={`text-base md:text-lg min-h-[150px] ${
              formData.message.error ? "border-red-500 focus-visible:ring-red-500" : ""
            }`}
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
            disabled={isLoading}
          />
          {formData.message.error && (
            <p className="text-sm text-red-500">{formData.message.error}</p>
          )}
        </motion.div>

        {status.type && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg flex items-center gap-2 ${
              status.type === "success"
                ? "bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800"
            }`}
          >
            {status.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
            )}
            <p className="text-sm md:text-base">{status.message}</p>
          </motion.div>
        )}

        <motion.div
          variants={itemVariants}
          className="pt-2"
        >
          <Button
            type="submit"
            size="lg"
            disabled={isLoading}
            className="w-full text-base md:text-lg h-12 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                Sending...
                <Loader2 className="ml-2 h-5 w-5 animate-spin" />
              </>
            ) : (
              <>
                Send Message
                <Send className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
}
