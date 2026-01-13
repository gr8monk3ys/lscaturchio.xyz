import { NextRequest, NextResponse } from "next/server";
import { withRateLimit } from "@/lib/with-rate-limit";
import { RATE_LIMITS } from "@/lib/rate-limit";
import { escapeHtml, sanitizeForHtmlEmail, sanitizeEmailSubject } from "@/lib/sanitize";
import { logError, logInfo } from "@/lib/logger";
import { contactFormSchema, parseBody } from "@/lib/validations";

async function handler(req: NextRequest) {
  if (req.method !== "POST") {
    return NextResponse.json(
      { error: "Method not allowed" },
      { status: 405 }
    );
  }

  try {
    const body = await req.json();

    // Zod validation
    const parsed = parseBody(contactFormSchema, body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error },
        { status: 400 }
      );
    }

    const { name, email, message } = parsed.data;

    // Check if Resend API key is configured
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      // Log for debugging but return success to user
      logInfo("Contact Form: No RESEND_API_KEY configured", {
        component: 'contact',
        name,
        email,
        messageLength: message.length,
      });

      return NextResponse.json({
        success: true,
        message: "Message received! (Email not configured - check server logs)",
      });
    }

    // Send email using Resend
    const contactEmail = process.env.CONTACT_EMAIL || "lorenzo@lscaturchio.xyz";
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
      logError("Contact Form: Resend API error", errorData, { component: 'contact', action: 'POST' });

      return NextResponse.json(
        { error: "Failed to send message. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Message sent successfully! I'll get back to you soon.",
    });
  } catch (error) {
    logError("Contact Form: Unexpected error", error, { component: 'contact', action: 'POST' });
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit(handler, RATE_LIMITS.NEWSLETTER);
