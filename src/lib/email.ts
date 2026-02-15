/**
 * Email utilities for newsletter and notifications
 *
 * Uses Resend API for email delivery.
 * Falls back to console logging when RESEND_API_KEY is not configured.
 */

import { logError, logInfo } from './logger';
import { NEWSLETTER_TOPICS } from '@/constants/newsletter';
import { getSiteUrl } from '@/lib/site-url';

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
  const siteUrl = getSiteUrl();
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

export async function sendOnboardingEmail(
  email: string,
  unsubscribeToken: string,
  step: number,
  options: { topics?: string[] } = {}
): Promise<boolean> {
  const siteUrl = getSiteUrl();
  const unsubscribeUrl = `${siteUrl}/unsubscribe?token=${unsubscribeToken}`;
  const topics = (options.topics ?? [])
    .map((t) => String(t).trim())
    .filter(Boolean)
    .slice(0, 6);

  const topicLinks = topics
    .map((id) => {
      const label = NEWSLETTER_TOPICS.find((t) => t.id === id)?.label ?? id;
      const href = `${siteUrl}/topics/${encodeURIComponent(id)}`;
      return { id, label, href };
    })
    .slice(0, 6);

  if (step === 1) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #111827; max-width: 640px; margin: 0 auto; padding: 20px;">
        <div style="background: #0f2a1b; padding: 28px; border-radius: 12px 12px 0 0; text-align: left;">
          <div style="font-size: 12px; letter-spacing: 1.8px; text-transform: uppercase; color: rgba(255,255,255,0.7); font-weight: 700;">Start Here</div>
          <h1 style="color: white; margin: 10px 0 0; font-size: 22px;">A few good places to begin</h1>
        </div>

        <div style="background: #f9fafb; padding: 28px; border-radius: 0 0 12px 12px;">
          <p style="margin-top: 0;">Thanks again for subscribing. If you want a quick path through the site, here are a few starting points.</p>

          ${topicLinks.length > 0 ? `
            <p style="margin: 18px 0 10px; font-weight: 700;">Your topics</p>
            <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 18px;">
              ${topicLinks
                .map(
                  (t) =>
                    `<a href="${t.href}" style="display: inline-block; padding: 10px 12px; border-radius: 999px; background: rgba(15, 42, 27, 0.08); color: #0f2a1b; text-decoration: none; font-weight: 700; font-size: 13px;">${t.label}</a>`
                )
                .join("")}
            </div>
          ` : ""}

          <div style="display: flex; gap: 12px; flex-wrap: wrap; margin: 18px 0 22px;">
            <a href="${siteUrl}/blog" style="display: inline-block; background: #0f2a1b; color: white; padding: 12px 16px; text-decoration: none; border-radius: 10px; font-weight: 700;">Browse the blog</a>
            <a href="${siteUrl}/projects" style="display: inline-block; background: white; color: #0f2a1b; padding: 12px 16px; text-decoration: none; border-radius: 10px; font-weight: 700; border: 1px solid rgba(15, 42, 27, 0.18);">View case studies</a>
          </div>

          <p style="margin: 0;">Cheers,<br>Lorenzo</p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 22px 0;">

          <p style="font-size: 12px; color: #6b7280; text-align: center; margin: 0;">
            You’re receiving this because you subscribed.<br>
            <a href="${unsubscribeUrl}" style="color: #6b7280;">Unsubscribe</a>
          </p>
        </div>
      </body>
      </html>
    `;

    return sendEmail({
      to: email,
      subject: "Start here: a quick path through the site",
      html,
    });
  }

  if (step === 2) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #111827; max-width: 640px; margin: 0 auto; padding: 20px;">
        <div style="background: #0f2a1b; padding: 28px; border-radius: 12px 12px 0 0; text-align: left;">
          <div style="font-size: 12px; letter-spacing: 1.8px; text-transform: uppercase; color: rgba(255,255,255,0.7); font-weight: 700;">Work With Me</div>
          <h1 style="color: white; margin: 10px 0 0; font-size: 22px;">Need help shipping this stuff?</h1>
        </div>

        <div style="background: #f9fafb; padding: 28px; border-radius: 0 0 12px 12px;">
          <p style="margin-top: 0;">If you’re building RAG/ML systems or shipping a product that needs to be reliable in production, I can help.</p>
          <ul style="padding-left: 18px; margin: 14px 0 18px;">
            <li>Architecture + review sessions</li>
            <li>RAG evals, guardrails, and reliability</li>
            <li>Shipping clean web UX around AI</li>
          </ul>

          <div style="display: flex; gap: 12px; flex-wrap: wrap; margin: 18px 0 22px;">
            <a href="${siteUrl}/work-with-me" style="display: inline-block; background: #0f2a1b; color: white; padding: 12px 16px; text-decoration: none; border-radius: 10px; font-weight: 700;">See packages</a>
            <a href="${siteUrl}/contact" style="display: inline-block; background: white; color: #0f2a1b; padding: 12px 16px; text-decoration: none; border-radius: 10px; font-weight: 700; border: 1px solid rgba(15, 42, 27, 0.18);">Contact me</a>
          </div>

          <p style="margin: 0;">Cheers,<br>Lorenzo</p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 22px 0;">

          <p style="font-size: 12px; color: #6b7280; text-align: center; margin: 0;">
            You’re receiving this because you subscribed.<br>
            <a href="${unsubscribeUrl}" style="color: #6b7280;">Unsubscribe</a>
          </p>
        </div>
      </body>
      </html>
    `;

    return sendEmail({
      to: email,
      subject: "Work with me (if you need a hand shipping)",
      html,
    });
  }

  // Unknown step: no-op.
  return false;
}

/**
 * Generate an unsubscribe URL for a given token
 */
export function getUnsubscribeUrl(token: string): string {
  const siteUrl = getSiteUrl();
  return `${siteUrl}/unsubscribe?token=${token}`;
}
