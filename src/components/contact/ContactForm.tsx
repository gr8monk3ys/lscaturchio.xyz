"use client";

import { Github, Linkedin, Twitter } from "lucide-react";
import Link from "next/link";
import { m } from '@/lib/motion';
import { useState } from "react";

const contactMethods = [
  {
    title: "Discovery Call",
    description: "Best for scoped projects, audits, and fast go or no-go decisions",
    action: "Book 30 Minutes",
    href: "https://calendly.com/gr8monk3ys/30min",
    external: true,
  },
  {
    title: "Async Brief",
    description: "Best if you already have links, context, and constraints to share",
    action: "Send a Brief",
    href: "mailto:lorenzosca7@protonmail.ch",
    external: true,
  },
  {
    title: "Remote Collaboration",
    description: "Based in Southern California and available for remote work worldwide",
    action: "Remote-first delivery",
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
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-3 divide-border border-y border-border md:divide-x mb-16"
      >
        {contactMethods.map((method) => (
          <div key={method.title} className="px-5 py-6">
            <h3 className="label-mono">{method.title}</h3>
            <p className="text-muted-foreground text-sm mt-2 mb-4">{method.description}</p>
            {method.href ? (
              <Link
                href={method.href}
                target={method.external ? "_blank" : undefined}
                rel={method.external ? "noopener noreferrer" : undefined}
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                {method.action}
              </Link>
            ) : (
              <span className="text-sm text-muted-foreground">{method.action}</span>
            )}
          </div>
        ))}
      </m.div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <m.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="label-mono mb-6">Send a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="neu-input w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary"
                  placeholder="Your name..."
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="email"
                  spellCheck={false}
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="neu-input w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary"
                  placeholder="you@example.com..."
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
                name="subject"
                autoComplete="off"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="neu-input w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary"
                placeholder="What is the decision or project?..."
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                autoComplete="off"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="neu-input w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary resize-none"
                placeholder="Share the goal, the users, the data, and the constraint that matters most..."
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="cta-primary w-full px-6 py-3 rounded-xl disabled:opacity-50"
            >
              {isSubmitting ? "Sending..." : "Send Project Details"}
            </button>

            <div aria-live="polite" className="min-h-6">
              {submitStatus === "success" && (
                <p className="text-center text-primary">
                  Message sent. I&apos;ll follow up by email after I review the brief.
                </p>
              )}
              {submitStatus === "error" && (
                <p className="text-center text-red-600">
                  Message failed to send. Please try again or email me directly at
                  {" "}
                  <Link href="mailto:lorenzosca7@protonmail.ch" className="underline">
                    lorenzosca7@protonmail.ch
                  </Link>
                  .
                </p>
              )}
            </div>
          </form>
        </m.div>

        {/* Additional Info */}
        <m.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-8"
        >
          {/* What to Expect */}
          <div>
            <h3 className="label-mono mb-4">What Helps Me Reply Fast</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">→</span>
                <span>The outcome you want and who the system is for</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">→</span>
                <span>The data sources, tools, or systems already in play</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">→</span>
                <span>The biggest risk, bottleneck, or failure mode you are seeing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">→</span>
                <span>Timing, budget guardrails, or any decision deadline</span>
              </li>
            </ul>
          </div>

          {/* Current Availability */}
          <div className="border-t border-border pt-8">
            <h3 className="label-mono mb-2">Current Availability</h3>
            <p className="text-muted-foreground mb-4">
              I&apos;m currently accepting new consulting and build engagements.
            </p>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse" />
              <span className="text-sm font-medium text-primary">Available for new work</span>
            </div>
          </div>

          {/* Social Links */}
          <div className="border-t border-border pt-8">
            <h3 className="label-mono mb-4">Connect on Social</h3>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-border rounded-lg p-3 hover:text-primary hover:border-primary transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>
        </m.div>
      </div>
    </div>
  );
}
