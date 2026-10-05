import { withWriteRoute, writeError } from "@/lib/api/write-route";
import { logNotice } from "@/lib/logger";
import { contactInbox, deliverMail } from "@/lib/mail/deliver";
import { renderContactNotification } from "@/lib/mail/templates";
import { contactFormSchema } from "@/lib/validations";
import { spamSignal } from "@/lib/contact-spam";
import { isBotRequest } from "@/lib/bot-id";

const SENT_MESSAGE = "Message sent successfully! I'll get back to you soon.";

export const POST = withWriteRoute(
  {
    limit: "CONTACT",
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
    // bot is not told. `logNotice`: `logInfo` prints only in development and
    // `logWarn` raises a Sentry event per bot, so this line is how the count
    // shows up in Vercel's runtime logs.
    const signal = spamSignal(data);
    if (signal) {
      logNotice(`[contact] dropped submission: ${signal}`);
      return { message: SENT_MESSAGE };
    }

    // A refusal, not a silent drop: BotID can misjudge a person, and they need
    // to know the message did not arrive. The form adds the direct email
    // address under any failure that names no field.
    if (await isBotRequest({ component: "contact", action: "POST" })) {
      throw writeError.forbidden("This message was flagged as automated and was not sent.");
    }

    // deliverMail logs either failure itself, without the sender's address.
    const outcome = await deliverMail(
      {
        from: "contact",
        to: contactInbox(),
        replyTo: email,
        ...renderContactNotification({ name, email, subject, message }),
      },
      { component: "contact", action: "POST" }
    );

    if (outcome.status === "not-configured") {
      throw writeError.internal(
        "Contact form is temporarily unavailable. Please try again later."
      );
    }
    if (outcome.status === "failed") {
      throw writeError.internal("Failed to send message. Please try again later.");
    }

    return { message: SENT_MESSAGE };
  }
);
