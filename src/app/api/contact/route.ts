import { withWriteRoute, writeError } from "@/lib/api/write-route";
import { contactInbox, deliverMail } from "@/lib/mail/deliver";
import { renderContactNotification } from "@/lib/mail/templates";
import { contactFormSchema } from "@/lib/validations";

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
    guard: {
      kind: "humanForm",
      path: "/api/contact",
      // Typing a name, an email, a subject and a message takes longer.
      minFillMs: 3000,
      // The form adds the direct email address under any failure that names
      // no field, so a person BotID misjudges still has a way through.
      refusal: "This message was flagged as automated and was not sent.",
      dropped: { message: SENT_MESSAGE },
    },
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
