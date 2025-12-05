"use client";

import { Container } from "@/components/Container";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Send, Calendar, Github, Linkedin, Twitter, MapPin, Clock, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";

const socialLinks = [
  { icon: Github, href: "https://github.com/gr8monk3ys", label: "GitHub" },
  { icon: Linkedin, href: "https://linkedin.com/in/lscaturchio", label: "LinkedIn" },
  { icon: Twitter, href: "https://twitter.com/lscaturchio", label: "Twitter" },
];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({ name: "", email: "", message: "" });
      } else {
        setSubmitStatus("error");
        setErrorMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setSubmitStatus("error");
      setErrorMessage("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container size="large">
      <div className="py-12 px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Have a project idea, question, or just want to say hi? I&apos;d love to hear from you.
            Fill out the form below or reach out through any of my social channels.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                  placeholder="Tell me about your project, idea, or question..."
                />
              </div>

              {submitStatus === "success" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-4 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Message sent successfully! I&apos;ll get back to you soon.</span>
                </motion.div>
              )}

              {submitStatus === "error" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400"
                >
                  {errorMessage}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Quick Contact */}
            <div className="bg-secondary/30 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Contact</h2>
              <div className="space-y-4">
                <a
                  href="mailto:lorenzo@lscaturchio.xyz"
                  className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  <span>lorenzo@lscaturchio.xyz</span>
                </a>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="w-5 h-5" />
                  <span>Southern California, USA</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Clock className="w-5 h-5" />
                  <span>PST (UTC-8)</span>
                </div>
              </div>
            </div>

            {/* Schedule a Call */}
            <div className="bg-secondary/30 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4">Prefer to Talk?</h2>
              <p className="text-muted-foreground mb-4 text-sm">
                Schedule a free 30-minute call to discuss your project or ideas.
              </p>
              <Link
                href="https://calendly.com/gr8monk3ys/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-primary/10 text-primary rounded-lg font-medium hover:bg-primary/20 transition-colors"
              >
                <Calendar className="w-5 h-5" />
                Schedule a Call
              </Link>
            </div>

            {/* Social Links */}
            <div className="bg-secondary/30 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4">Connect</h2>
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <Link
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-lg bg-background hover:bg-primary/10 transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Response Time */}
            <div className="text-sm text-muted-foreground">
              <p>
                I typically respond within 24-48 hours. For urgent matters,
                please schedule a call.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </Container>
  );
}
