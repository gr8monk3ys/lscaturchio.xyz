"use client";

import { IconBrandGithub, IconBrandLinkedin, IconBrandTwitter } from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";

const socialLinks = [
  { icon: IconBrandGithub, href: "https://github.com/gr8monk3ys", label: "GitHub" },
  { icon: IconBrandLinkedin, href: "https://linkedin.com/in/lorenzo-scaturchio", label: "LinkedIn" },
  { icon: IconBrandTwitter, href: "https://twitter.com/gr8monk3ys", label: "Twitter" },
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
  /**
   * What actually went wrong, and which input it was about.
   *
   * The API already diagnoses every failure separately — a rate limit, a
   * missing Resend key, a rejected field, a Resend outage each return their own
   * sentence — and this component used to discard all of it and print "Message
   * failed to send. Please try again" over the top. A reader whose message was
   * one character over the limit was told to try again, and trying again did
   * the same thing.
   */
  const [failure, setFailure] = useState<{ message: string; field?: string } | null>(
    null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFailure(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
        return;
      }

      // The typed message is never cleared on failure; it is the most expensive
      // thing on the page to retype.
      const body = (await response.json().catch(() => null)) as {
        error?: string;
        field?: string;
      } | null;

      setSubmitStatus("error");
      setFailure({
        message:
          body?.error ??
          (response.status === 429
            ? "Too many messages from this address in a short window. Try again in a few minutes."
            : "The message did not send."),
        field: body?.field,
      });
    } catch {
      setSubmitStatus("error");
      setFailure({
        message:
          "The request never reached the server — usually a dropped connection rather than anything you typed.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /** The message rendered under a field, when the failure named that field. */
  const fieldError = (name: string) =>
    submitStatus === "error" && failure?.field === name ? failure.message : null;

  return (
    <div className="max-w-6xl mx-auto">
      {/* The three-tile "contact methods" band that sat here is gone. Every
          actionable item in it duplicated a CTA in the page masthead above —
          "Book 30 Minutes" was the same Calendly link as "Book a call", "Send
          a Brief" the same mailto as "Email Directly" — and the third tile
          ("Remote-first delivery") was not an action at all; the response
          expectations beside this form already say "Remote worldwide". A
          reviewer counted seven ways to make contact on this page, two of them
          the same action under two names. It was also the second of two
          three-column bands, which DESIGN.md's Don't list bans outright. */}
      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div>
          <h2 className="text-section-title mb-6">Send a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <div className="mb-2 flex items-baseline gap-2">
                  <label htmlFor="name" className="block text-sm font-medium">
                    Name
                  </label>
                  {/* Wall label: the required marker is metadata, not part of the field name. */}
                  <span aria-hidden="true" className="label-mono">Required</span>
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  aria-invalid={fieldError("name") ? true : undefined}
                  aria-describedby={fieldError("name") ? "name-error" : undefined}
                  className="neu-input w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary aria-invalid:border-destructive"
                  placeholder="Your name..."
                />
                {fieldError("name") && (
                  <p id="name-error" className="mt-2 text-sm text-destructive">
                    {fieldError("name")}
                  </p>
                )}
              </div>
              <div>
                <div className="mb-2 flex items-baseline gap-2">
                  <label htmlFor="email" className="block text-sm font-medium">
                    Email
                  </label>
                  {/* Wall label: the required marker is metadata, not part of the field name. */}
                  <span aria-hidden="true" className="label-mono">Required</span>
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="email"
                  spellCheck={false}
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  aria-invalid={fieldError("email") ? true : undefined}
                  aria-describedby={fieldError("email") ? "email-error" : undefined}
                  className="neu-input w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary aria-invalid:border-destructive"
                  placeholder="you@example.com..."
                />
                {fieldError("email") && (
                  <p id="email-error" className="mt-2 text-sm text-destructive">
                    {fieldError("email")}
                  </p>
                )}
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-baseline gap-2">
                <label htmlFor="subject" className="block text-sm font-medium">
                  Subject
                </label>
                {/* Wall label: the required marker is metadata, not part of the field name. */}
                <span aria-hidden="true" className="label-mono">Required</span>
              </div>
              <input
                type="text"
                id="subject"
                name="subject"
                autoComplete="off"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                aria-invalid={fieldError("subject") ? true : undefined}
                aria-describedby={fieldError("subject") ? "subject-error" : undefined}
                className="neu-input w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary aria-invalid:border-destructive"
                placeholder="What is the decision or project?..."
              />
              {fieldError("subject") && (
                <p id="subject-error" className="mt-2 text-sm text-destructive">
                  {fieldError("subject")}
                </p>
              )}
            </div>
            <div>
              <div className="mb-2 flex items-baseline gap-2">
                <label htmlFor="message" className="block text-sm font-medium">
                  Message
                </label>
                {/* Wall label: the required marker is metadata, not part of the field name. */}
                <span aria-hidden="true" className="label-mono">Required</span>
              </div>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                autoComplete="off"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                aria-invalid={fieldError("message") ? true : undefined}
                aria-describedby={fieldError("message") ? "message-error" : undefined}
                className="neu-input w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary resize-none aria-invalid:border-destructive"
                placeholder="Share the goal, the users, the data, and the constraint that matters most..."
              />
              {fieldError("message") && (
                <p id="message-error" className="mt-2 text-sm text-destructive">
                  {fieldError("message")}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="cta-primary w-full px-6 py-3 rounded-xl disabled:opacity-50"
            >
              {isSubmitting ? "Sending..." : "Send Project Details"}
            </button>

            <div id="contact-form-status" role="status" aria-live="polite" className="min-h-6">
              {submitStatus === "success" && (
                <p className="text-primary">
                  Message sent. I&apos;ll follow up by email after I review the brief.
                </p>
              )}
              {/* A failure that named a field is already rendered beside that
                  field; repeating it here would say it twice. */}
              {submitStatus === "error" && !failure?.field && (
                <p className="text-destructive">
                  {failure?.message} You can also email me directly at{" "}
                  <Link href="mailto:lorenzosca7@protonmail.ch" className="underline">
                    lorenzosca7@protonmail.ch
                  </Link>
                  .
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Additional Info */}
        <div className="space-y-8">
          {/* What to Expect */}
          <div>
            <h3 className="text-card-title mb-4">What helps me reply fast</h3>
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
            <h3 className="text-card-title mb-2">Current availability</h3>
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
            <h3 className="text-card-title mb-4">Connect on Social</h3>
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
        </div>
      </div>
    </div>
  );
}
