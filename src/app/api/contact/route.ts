import { RATE_LIMITS } from "@/lib/rate-limit";
import { withWriteRoute, writeError } from "@/lib/api/write-route";
import { escapeHtml, sanitizeForHtmlEmail, sanitizeEmailSubject } from "@/lib/sanitize";
import { logError } from "@/lib/logger";
import { contactFormSchema } from "@/lib/validations";
import { spamSignal } from "@/lib/contact-spam";
import { isBotRequest } from "@/lib/bot-id";

const SENT_MESSAGE = "Message sent successfully! I'll get back to you soon.";

export const POST = withWriteRoute(
  {
    limit: RATE_LIMITS.NEWSLETTER,
    auth: {
      kind: "public",
      reason: "The contact form is the site's front door; anyone must be able to reach it.",
    },
    csrf: { kind: "required" },
    body: { kind: "json", schema: contactFormSchema },
    envelope: { kind: "standard" },
    errors: {
      log: "Contact Form: Unexpected error",
      component: "contact",
      action: "POST",
      message: "An unexpected error occurred. Please try again later.",
    },
  },
  async ({ data }) => {
    const { name, email, subject, message } = data;

    // Answered as a success and not mailed. See contact-spam.ts for why the
    // bot is not told. `console.info` rather than the logger: `logInfo` prints
    // only in development and `logWarn` raises a Sentry event per bot, so this
    // line is how the count shows up in Vercel's runtime logs.
    const signal = spamSignal(data);
    if (signal) {
      console.info(`[contact] dropped submission: ${signal}`);
      return { message: SENT_MESSAGE };
    }

    // A refusal, not a silent drop: BotID can misjudge a person, and they need
    // to know the message did not arrive. The form adds the direct email
    // address under any failure that names no field.
    if (await isBotRequest({ component: "contact", action: "POST" })) {
      throw writeError.forbidden("This message was flagged as automated and was not sent.");
    }

    // Check if Resend API key is configured
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      logError("Contact Form: RESEND_API_KEY is not configured", null, {
        component: "contact",
        action: "POST",
      });
      throw writeError.internal(
        "Contact form is temporarily unavailable. Please try again later."
      );
    }

    // Send email using Resend
    const contactEmail = process.env.CONTACT_EMAIL || "lorenzosca7@protonmail.ch";
    const fromEmail = process.env.CONTACT_FROM_EMAIL || "contact@lscaturchio.xyz";

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail, // Must be verified domain in Resend
        to: contactEmail, // Destination email
        reply_to: email,
        // The reader's own subject leads; the name qualifies it. It used to
        // be discarded before it reached here.
        subject: sanitizeEmailSubject(`${subject} — ${name}`),
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>From:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
          <p><strong>Message:</strong></p>
          <p>${sanitizeForHtmlEmail(message)}</p>
          <hr>
          <p><small>Sent at ${new Date().toLocaleString()}</small></p>
        `,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      logError("Contact Form: Resend API error", errorData, { component: "contact", action: "POST" });

      throw writeError.internal("Failed to send message. Please try again later.");
    }

    return { message: SENT_MESSAGE };
  }
);
