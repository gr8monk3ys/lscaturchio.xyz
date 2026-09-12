"use client";

import { IconBrandGithub, IconBrandLinkedin, IconBrandTwitter } from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { contactFormSchema } from "@/lib/validations";

import { CONTACT_FIELD_LIMITS } from "@/lib/validations";

const socialLinks = [
  { icon: IconBrandGithub, href: "https://github.com/gr8monk3ys", label: "GitHub" },
  { icon: IconBrandLinkedin, href: "https://linkedin.com/in/lorenzo-scaturchio", label: "LinkedIn" },
  { icon: IconBrandTwitter, href: "https://twitter.com/gr8monk3ys", label: "Twitter" },
];

type ContactField = keyof typeof CONTACT_FIELD_LIMITS;

/**
 * How close to the cap a field has to be before the countdown appears.
 *
 * A counter that is always on is noise for the 99% of messages nowhere near
 * 5000 characters, and a counter that appears only at the cap arrives after the
 * browser has already started dropping keystrokes. The last tenth is the window
 * where the number is worth reading.
 */
const COUNTDOWN_THRESHOLD = 0.9;

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

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  /**
   * Send focus to the input the server rejected.
   *
   * A field-scoped error is rendered beside its input and wired up with
   * `aria-describedby`, which is only read out when that input has focus. After
   * a failed submit focus is still on the submit button, and the status region
   * deliberately stays silent for these (the message is already on screen once,
   * beside the field). So a screen-reader user heard nothing at all: the form
   * simply did not respond. Moving focus both announces the error — label,
   * value, invalid state and description, in one utterance — and puts the
   * caret where the correction has to be typed.
   *
   * In an effect rather than in the submit handler so the run happens after
   * React has committed `aria-invalid` and `aria-describedby`; focusing before
   * that commit announces the field as if nothing were wrong.
   */
  useEffect(() => {
    const field = failure?.field;
    if (!field) return;
    const inputs: Record<string, HTMLElement | null> = {
      name: nameRef.current,
      email: emailRef.current,
      subject: subjectRef.current,
      message: messageRef.current,
    };
    inputs[field]?.focus();
  }, [failure]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    /**
     * Validate here, with the schema the API validates against.
     *
     * The form carried `required` and nothing else, so the first failure a
     * visitor met was the browser's own bubble — a grey box in the platform
     * font, positioned by the browser, gone on the next keystroke, on a site
     * that otherwise owns every surface down to its scrollbars. It also
     * bypassed the field-scoped error rendering that already exists here,
     * complete with `aria-invalid`, `aria-describedby` and the focus move.
     *
     * `noValidate` is only safe because this reuses `contactFormSchema` —
     * literally the object `/api/contact` parses. A hand-written client copy
     * would be a second source of truth for what a valid message is, and the
     * two would drift.
     */
    const parsed = contactFormSchema.safeParse(formData);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const field = typeof issue?.path[0] === "string" ? issue.path[0] : undefined;
      setSubmitStatus("error");
      setFailure({ message: issue?.message ?? "Check the fields above.", field });
      return;
    }

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

  /** Characters left in a field, once it is close enough to the cap to matter. */
  const charactersLeft = (name: ContactField) => {
    const limit = CONTACT_FIELD_LIMITS[name];
    const used = formData[name].length;
    return used >= limit * COUNTDOWN_THRESHOLD ? limit - used : null;
  };

  /**
   * The error and the countdown are separate nodes, and a field can carry
   * either, both or neither — `aria-describedby` takes the ids that exist.
   */
  const describedBy = (name: ContactField) => {
    const ids = [
      fieldError(name) ? `${name}-error` : null,
      charactersLeft(name) === null ? null : `${name}-count`,
    ].filter(Boolean);
    return ids.length ? ids.join(" ") : undefined;
  };

  /**
   * `maxLength` stops the browser accepting the 5001st character, which is the
   * point — but it does it silently, and a paste longer than the cap is cut
   * without a word. The countdown is what makes that visible: it names the
   * number of characters left while there is still room, and says plainly what
   * happens at zero rather than letting the reader discover it by losing a
   * paragraph.
   *
   * Not a live region. It changes on every keystroke, and an `aria-live` node
   * updating per character talks over the person typing into it. It is in the
   * field's description instead, so it is read on focus and on demand.
   */
  const countdown = (name: ContactField) => {
    const left = charactersLeft(name);
    if (left === null) return null;
    return (
      <p
        id={`${name}-count`}
        className={`mt-2 text-sm ${left === 0 ? "text-destructive" : "text-muted-foreground"}`}
      >
        {left === 0
          ? `No characters left. Anything pasted beyond ${CONTACT_FIELD_LIMITS[name]} characters is dropped.`
          : `${left} characters left`}
      </p>
    );
  };

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
          <h2 className="text-section-title mb-6">Send a message</h2>
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
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
                  ref={nameRef}
                  type="text"
                  id="name"
                  name="name"
                  autoComplete="name"
                  required
                  maxLength={CONTACT_FIELD_LIMITS.name}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  aria-invalid={fieldError("name") ? true : undefined}
                  aria-describedby={describedBy("name")}
                  className="neu-input w-full px-4 py-3 rounded-xl aria-invalid:border-destructive"
                  placeholder="Your name..."
                />
                {fieldError("name") && (
                  <p id="name-error" className="mt-2 text-sm text-destructive">
                    {fieldError("name")}
                  </p>
                )}
                {countdown("name")}
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
                  ref={emailRef}
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="email"
                  spellCheck={false}
                  required
                  maxLength={CONTACT_FIELD_LIMITS.email}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  aria-invalid={fieldError("email") ? true : undefined}
                  aria-describedby={describedBy("email")}
                  className="neu-input w-full px-4 py-3 rounded-xl aria-invalid:border-destructive"
                  placeholder="you@example.com..."
                />
                {fieldError("email") && (
                  <p id="email-error" className="mt-2 text-sm text-destructive">
                    {fieldError("email")}
                  </p>
                )}
                {countdown("email")}
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
                ref={subjectRef}
                type="text"
                id="subject"
                name="subject"
                autoComplete="off"
                required
                maxLength={CONTACT_FIELD_LIMITS.subject}
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                aria-invalid={fieldError("subject") ? true : undefined}
                aria-describedby={describedBy("subject")}
                className="neu-input w-full px-4 py-3 rounded-xl aria-invalid:border-destructive"
                placeholder="What is the decision or project?..."
              />
              {fieldError("subject") && (
                <p id="subject-error" className="mt-2 text-sm text-destructive">
                  {fieldError("subject")}
                </p>
              )}
              {countdown("subject")}
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
                ref={messageRef}
                id="message"
                name="message"
                required
                rows={5}
                autoComplete="off"
                maxLength={CONTACT_FIELD_LIMITS.message}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                aria-invalid={fieldError("message") ? true : undefined}
                aria-describedby={describedBy("message")}
                className="neu-input w-full px-4 py-3 rounded-xl resize-none aria-invalid:border-destructive"
                placeholder="Share the goal, the users, the data, and the constraint that matters most..."
              />
              {fieldError("message") && (
                <p id="message-error" className="mt-2 text-sm text-destructive">
                  {fieldError("message")}
                </p>
              )}
              {countdown("message")}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="cta-primary w-full px-6 py-3 rounded-xl disabled:opacity-50"
            >
              {isSubmitting ? "Sending..." : "Send Project Details"}
            </button>

            {/* Two regions, not one, because the two outcomes have different
                urgency. A confirmation can wait for a gap in what the screen
                reader is already saying; a failure cannot — the reader is about
                to walk away believing the message went. One `aria-live="polite"`
                region served both, so the failure queued behind whatever else
                was speaking.

                Both are mounted empty from the first render and filled later:
                `aria-live` is watched for changes inside a node already in the
                tree, and a region that appears at the same moment as its text
                announces nothing. That is the bug the newsletter form hit.

                The wrapper keeps the `contact-form-status` id, which names this
                one region for tests and for e2e — an unnamed selector once
                matched two. */}
            <div id="contact-form-status" className="min-h-6">
              <p role="status" aria-live="polite" className="text-primary">
                {submitStatus === "success" &&
                  "Message sent. I'll follow up by email after I review the brief."}
              </p>
              {/* A failure that named a field is already rendered beside that
                  field, and focus has moved there, which announces it. Repeating
                  it here would say it twice. */}
              <p role="alert" aria-live="assertive" className="text-destructive">
                {submitStatus === "error" && !failure?.field && (
                  <>
                    {failure?.message} You can also email me directly at{" "}
                    <Link href="mailto:lorenzosca7@protonmail.ch" className="underline">
                      lorenzosca7@protonmail.ch
                    </Link>
                    .
                  </>
                )}
              </p>
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
            {/* Static, and hidden from assistive tech.
                This was a 10x10px dot on `animate-pulse`, animating forever.
                DESIGN.md:360 sanctions `animate-pulse` for skeletons — things
                that are waiting on data — and DESIGN.md:337 states the site
                animates continuously in exactly one place. An availability dot
                is not waiting for anything; it is decoration that had appointed
                itself the second perpetual motion on the site, on the page a
                visitor is most likely to be reading carefully.
                The sentence beside it carries the entire meaning, so the dot is
                `aria-hidden` rather than being announced as an unnamed bullet. */}
            <div className="flex items-center gap-2">
              <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-primary" />
              <span className="text-sm font-medium text-primary">Available for new work</span>
            </div>
          </div>

          {/* Social Links */}
          <div className="border-t border-border pt-8">
            <h3 className="text-card-title mb-4">Connect on social</h3>
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
