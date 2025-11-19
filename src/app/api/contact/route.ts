import { NextRequest, NextResponse } from "next/server";
import { withRateLimit } from "@/lib/with-rate-limit";
import { RATE_LIMITS } from "@/lib/rate-limit";

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

async function handler(req: NextRequest) {
  if (req.method !== "POST") {
    return NextResponse.json(
      { error: "Method not allowed" },
      { status: 405 }
    );
  }

  try {
    const body = (await req.json()) as ContactFormData;
    const { name, email, message } = body;

    // Validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || email.trim().length === 0) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    if (message.length > 5000) {
      return NextResponse.json(
        { error: "Message too long (max 5000 characters)" },
        { status: 400 }
      );
    }

    // Check if Resend API key is configured
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      // Log to console for debugging but return success to user
      console.log("[Contact Form] No RESEND_API_KEY configured. Message:", {
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        message: "Message received! (Email not configured - check server logs)",
      });
    }

    // Send email using Resend
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "contact@lscaturchio.xyz", // Must be verified domain in Resend
        to: "lorenzo@lscaturchio.xyz", // Your email
        reply_to: email.trim(),
        subject: `Contact Form: ${name.trim()}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>From:</strong> ${name.trim()}</p>
          <p><strong>Email:</strong> ${email.trim()}</p>
          <p><strong>Message:</strong></p>
          <p>${message.trim().replace(/\n/g, "<br>")}</p>
          <hr>
          <p><small>Sent at ${new Date().toLocaleString()}</small></p>
        `,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("[Contact Form] Resend API error:", errorData);

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
    console.error("[Contact Form] Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit(handler, RATE_LIMITS.NEWSLETTER);
