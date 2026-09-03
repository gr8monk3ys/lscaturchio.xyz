import { RATE_LIMITS } from "@/lib/rate-limit";
import { withWriteRoute, writeError } from "@/lib/api/write-route";
import { escapeHtml, sanitizeForHtmlEmail, sanitizeEmailSubject } from "@/lib/sanitize";
import { logError } from "@/lib/logger";
import { contactFormSchema } from "@/lib/validations";

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
    const { name, email, message } = data;

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
        subject: sanitizeEmailSubject(`Contact Form: ${name}`),
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>From:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
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

    return { message: "Message sent successfully! I'll get back to you soon." };
  }
);
