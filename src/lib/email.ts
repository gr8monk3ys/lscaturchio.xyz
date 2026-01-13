/**
 * Email utilities for newsletter and notifications
 *
 * Uses Resend API for email delivery.
 * Falls back to console logging when RESEND_API_KEY is not configured.
 */

import { logError, logInfo } from './logger';

const RESEND_API_URL = 'https://api.resend.com/emails';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Send an email using Resend API
 */
async function sendEmail(options: EmailOptions): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = options.from || process.env.NEWSLETTER_FROM_EMAIL || 'newsletter@lscaturchio.xyz';

  if (!resendApiKey) {
    logInfo('Email: No RESEND_API_KEY configured', {
      component: 'email',
      to: options.to,
      subject: options.subject,
    });
    return false;
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: options.to,
        subject: options.subject,
        html: options.html,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      logError('Email: Resend API error', errorData, { component: 'email', to: options.to });
      return false;
    }

    logInfo('Email: Sent successfully', { component: 'email', to: options.to, subject: options.subject });
    return true;
  } catch (error) {
    logError('Email: Failed to send', error, { component: 'email', to: options.to });
    return false;
  }
}

/**
 * Send welcome email to new newsletter subscriber
 */
export async function sendWelcomeEmail(email: string, unsubscribeToken: string): Promise<boolean> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lscaturchio.xyz';
  const unsubscribeUrl = `${siteUrl}/unsubscribe?token=${unsubscribeToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to My Newsletter!</h1>
      </div>

      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
        <p>Hey there!</p>

        <p>Thanks for subscribing to my newsletter. I'm excited to have you join the community!</p>

        <p>Here's what you can expect:</p>
        <ul style="padding-left: 20px;">
          <li>Insights on AI, data science, and web development</li>
          <li>Behind-the-scenes of my projects</li>
          <li>Curated resources and tools I find useful</li>
          <li>Occasional personal reflections on tech and life</li>
        </ul>

        <p>In the meantime, feel free to check out my latest blog posts:</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${siteUrl}/blog" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">Read the Blog</a>
        </div>

        <p>Cheers,<br>Lorenzo</p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

        <p style="font-size: 12px; color: #6b7280; text-align: center;">
          You're receiving this email because you subscribed to my newsletter.<br>
          <a href="${unsubscribeUrl}" style="color: #6b7280;">Unsubscribe</a>
        </p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: "Welcome to Lorenzo's Newsletter!",
    html,
  });
}

/**
 * Generate an unsubscribe URL for a given token
 */
export function getUnsubscribeUrl(token: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lscaturchio.xyz';
  return `${siteUrl}/unsubscribe?token=${token}`;
}
