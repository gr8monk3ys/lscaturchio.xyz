/**
 * The site's email bodies, as pure renderers: data in, `{ subject, html }`
 * out. Sending them is `deliverMail`'s job (./deliver).
 *
 * Every style is inline and in px on purpose: mail clients strip <style>
 * blocks and treat rem unreliably. See the `inline-css-type-ramp` allowance
 * in design-drift.test.ts.
 */

import { NEWSLETTER_TOPICS } from "@/constants/newsletter";
import { escapeHtml, sanitizeEmailSubject, sanitizeForHtmlEmail } from "@/lib/sanitize";
import { getSiteUrl } from "@/lib/site-url";

export interface RenderedMail {
  subject: string;
  html: string;
}

function unsubscribeUrl(siteUrl: string, unsubscribeToken: string): string {
  return `${siteUrl}/unsubscribe?token=${unsubscribeToken}`;
}

/** Sent to a new or returning newsletter subscriber. */
export function renderWelcomeEmail(unsubscribeToken: string): RenderedMail {
  const siteUrl = getSiteUrl();
  const unsubscribeHref = unsubscribeUrl(siteUrl, unsubscribeToken);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Instrument Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #1a1f23; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #184e35; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 25px;">Welcome to My Newsletter!</h1>
      </div>

      <div style="background: #f9f8f5; padding: 30px; border-radius: 0 0 10px 10px;">
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
          <a href="${siteUrl}/blog" style="display: inline-block; background: #184e35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">Read the Blog</a>
        </div>

        <p>Cheers,<br>Lorenzo</p>

        <hr style="border: none; border-top: 1px solid #e2dbd5; margin: 30px 0;">

        <p style="font-size: 12px; color: #606976; text-align: center;">
          You're receiving this email because you subscribed to my newsletter.<br>
          <a href="${unsubscribeHref}" style="color: #606976;">Unsubscribe</a>
        </p>
      </div>
    </body>
    </html>
  `;

  return { subject: "Welcome to Lorenzo's Newsletter!", html };
}

/**
 * The onboarding drip: step 1 a day after signup, step 2 about a week in.
 * Any other step has no email, and returns null.
 */
export function renderOnboardingEmail(
  unsubscribeToken: string,
  step: number,
  options: { topics?: string[] } = {}
): RenderedMail | null {
  const siteUrl = getSiteUrl();
  const unsubscribeHref = unsubscribeUrl(siteUrl, unsubscribeToken);
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
      <body style="font-family: 'Instrument Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #1a1f23; max-width: 640px; margin: 0 auto; padding: 20px;">
        <div style="background: #184e35; padding: 28px; border-radius: 12px 12px 0 0; text-align: left;">
          <div style="font-size: 12px; letter-spacing: 1.8px; text-transform: uppercase; color: rgba(255,255,255,0.7); font-weight: 700;">Start Here</div>
          <h1 style="color: white; margin: 10px 0 0; font-size: 20px;">A few good places to begin</h1>
        </div>

        <div style="background: #f9f8f5; padding: 28px; border-radius: 0 0 12px 12px;">
          <p style="margin-top: 0;">Thanks again for subscribing. If you want a quick path through the site, here are a few starting points.</p>

          ${topicLinks.length > 0 ? `
            <p style="margin: 18px 0 10px; font-weight: 700;">Your topics</p>
            <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 18px;">
              ${topicLinks
                .map(
                  (t) =>
                    `<a href="${t.href}" style="display: inline-block; padding: 10px 12px; border-radius: 999px; background: rgba(24, 78, 53, 0.08); color: #184e35; text-decoration: none; font-weight: 700; font-size: 12px;">${t.label}</a>`
                )
                .join("")}
            </div>
          ` : ""}

          <div style="display: flex; gap: 12px; flex-wrap: wrap; margin: 18px 0 22px;">
            <a href="${siteUrl}/blog" style="display: inline-block; background: #184e35; color: white; padding: 12px 16px; text-decoration: none; border-radius: 10px; font-weight: 700;">Browse the blog</a>
            <a href="${siteUrl}/projects" style="display: inline-block; background: white; color: #184e35; padding: 12px 16px; text-decoration: none; border-radius: 10px; font-weight: 700; border: 1px solid rgba(24, 78, 53, 0.18);">View case studies</a>
          </div>

          <p style="margin: 0;">Cheers,<br>Lorenzo</p>

          <hr style="border: none; border-top: 1px solid #e2dbd5; margin: 22px 0;">

          <p style="font-size: 12px; color: #606976; text-align: center; margin: 0;">
            You’re receiving this because you subscribed.<br>
            <a href="${unsubscribeHref}" style="color: #606976;">Unsubscribe</a>
          </p>
        </div>
      </body>
      </html>
    `;

    return { subject: "Start here: a quick path through the site", html };
  }

  if (step === 2) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Instrument Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #1a1f23; max-width: 640px; margin: 0 auto; padding: 20px;">
        <div style="background: #184e35; padding: 28px; border-radius: 12px 12px 0 0; text-align: left;">
          <div style="font-size: 12px; letter-spacing: 1.8px; text-transform: uppercase; color: rgba(255,255,255,0.7); font-weight: 700;">Work With Me</div>
          <h1 style="color: white; margin: 10px 0 0; font-size: 20px;">Need help shipping this stuff?</h1>
        </div>

        <div style="background: #f9f8f5; padding: 28px; border-radius: 0 0 12px 12px;">
          <p style="margin-top: 0;">If you’re building RAG/ML systems or shipping a product that needs to be reliable in production, I can help.</p>
          <ul style="padding-left: 18px; margin: 14px 0 18px;">
            <li>Architecture + review sessions</li>
            <li>RAG evals, guardrails, and reliability</li>
            <li>Shipping clean web UX around AI</li>
          </ul>

          <div style="display: flex; gap: 12px; flex-wrap: wrap; margin: 18px 0 22px;">
            <a href="${siteUrl}/work-with-me" style="display: inline-block; background: #184e35; color: white; padding: 12px 16px; text-decoration: none; border-radius: 10px; font-weight: 700;">See packages</a>
            <a href="${siteUrl}/contact" style="display: inline-block; background: white; color: #184e35; padding: 12px 16px; text-decoration: none; border-radius: 10px; font-weight: 700; border: 1px solid rgba(24, 78, 53, 0.18);">Contact me</a>
          </div>

          <p style="margin: 0;">Cheers,<br>Lorenzo</p>

          <hr style="border: none; border-top: 1px solid #e2dbd5; margin: 22px 0;">

          <p style="font-size: 12px; color: #606976; text-align: center; margin: 0;">
            You’re receiving this because you subscribed.<br>
            <a href="${unsubscribeHref}" style="color: #606976;">Unsubscribe</a>
          </p>
        </div>
      </body>
      </html>
    `;

    return { subject: "Work with me (if you need a hand shipping)", html };
  }

  return null;
}

/**
 * The notification the site's owner gets for a contact-form submission. Every
 * reader-supplied field is escaped; the subject is stripped of CR/LF so it
 * cannot inject a header.
 */
export function renderContactNotification(
  submission: { name: string; email: string; subject: string; message: string },
  sentAt: Date = new Date()
): RenderedMail {
  const { name, email, subject, message } = submission;

  return {
    // The reader's own subject leads; the name qualifies it.
    subject: sanitizeEmailSubject(`${subject} — ${name}`),
    html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>From:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
          <p><strong>Message:</strong></p>
          <p>${sanitizeForHtmlEmail(message)}</p>
          <hr>
          <p><small>Sent at ${sentAt.toLocaleString()}</small></p>
        `,
  };
}
