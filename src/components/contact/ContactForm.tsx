"use client";

import { Mail, Calendar, MapPin, Github, Linkedin, Twitter } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";

const contactMethods = [
  {
    icon: Calendar,
    title: "Schedule a Call",
    description: "Book a 30-minute call to discuss your project",
    action: "Book Now",
    href: "https://calendly.com/gr8monk3ys/30min",
    external: true,
  },
  {
    icon: Mail,
    title: "Send an Email",
    description: "Drop me a line anytime",
    action: "Email Me",
    href: "mailto:lorenzo@lscaturchio.xyz",
    external: true,
  },
  {
    icon: MapPin,
    title: "Location",
    description: "Based in Southern California",
    action: "Available for remote work worldwide",
    href: null,
    external: false,
  },
];

const socialLinks = [
  { icon: Github, href: "https://github.com/gr8monk3ys", label: "GitHub" },
  { icon: Linkedin, href: "https://linkedin.com/in/lorenzo-scaturchio", label: "LinkedIn" },
  { icon: Twitter, href: "https://twitter.com/gr8monk3ys", label: "Twitter" },
];

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setSubmitStatus("error");
      }
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Contact Methods */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-3 gap-6 mb-16"
      >
        {contactMethods.map((method, index) => (
          <motion.div
            key={method.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.1 }}
            className="neu-card p-6 text-center"
          >
            <div className="neu-flat-sm rounded-xl p-3 w-fit mx-auto mb-4">
              <method.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-card-title mb-2">{method.title}</h3>
            <p className="text-muted-foreground text-sm mb-4">{method.description}</p>
            {method.href ? (
              <Link
                href={method.href}
                target={method.external ? "_blank" : undefined}
                rel={method.external ? "noopener noreferrer" : undefined}
                className="cta-secondary px-4 py-2 rounded-lg text-sm inline-block"
              >
                {method.action}
              </Link>
            ) : (
              <span className="text-sm text-muted-foreground">{method.action}</span>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-section-title mb-6">Send a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="neu-input w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary"
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
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="neu-input w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium mb-2">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="neu-input w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary"
                placeholder="What is this about?"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2">
                Message
              </label>
              <textarea
                id="message"
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="neu-input w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary resize-none"
                placeholder="Tell me about your project..."
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="cta-primary w-full px-6 py-3 rounded-xl disabled:opacity-50"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>

            {submitStatus === "success" && (
              <p className="text-green-600 text-center">Message sent successfully!</p>
            )}
            {submitStatus === "error" && (
              <p className="text-red-600 text-center">Failed to send. Please try again.</p>
            )}
          </form>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-8"
        >
          {/* What to Expect */}
          <div className="neu-card p-6">
            <h3 className="text-subsection mb-4">What to Expect</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">→</span>
                <span>I typically respond within 24-48 hours</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">→</span>
                <span>Initial consultations are always free</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">→</span>
                <span>I&apos;m available for both short-term and long-term projects</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">→</span>
                <span>Remote collaboration with clients worldwide</span>
              </li>
            </ul>
          </div>

          {/* Current Availability */}
          <div className="neu-pressed rounded-xl p-6">
            <h3 className="text-subsection mb-2">Current Availability</h3>
            <p className="text-muted-foreground mb-4">
              I&apos;m currently accepting new projects and consulting engagements.
            </p>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-green-600">Available for work</span>
            </div>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-subsection mb-4">Connect on Social</h3>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="neu-button p-4 rounded-xl hover:text-primary transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="h-6 w-6" />
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
