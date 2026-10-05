import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { ContactForm } from "@/components/contact/ContactForm";
import { CONTACT_FIELD_LIMITS } from "@/lib/validations";
import { submitWrite, type WriteResult } from "@/lib/fetcher";

/**
 * The form is tested against decoder results, not hand-written HTTP bodies.
 * What each layer of the real route answers, and the kind it decodes to, is
 * pinned once against the real chain in src/__tests__/api/write-chain.test.ts;
 * the fixtures this replaced included a `{}` 429 the server never sends.
 */
vi.mock("@/lib/fetcher", () => ({ submitWrite: vi.fn() }));
const submitMock = vi.mocked(submitWrite);

const SENT: WriteResult<unknown> = {
  kind: "ok",
  data: { message: "Message sent successfully! I'll get back to you soon." },
};

function fillForm() {
  fireEvent.change(screen.getByLabelText("Name"), {
    target: { value: "Ada Lovelace" },
  });
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "ada@example.com" },
  });
  fireEvent.change(screen.getByLabelText("Subject"), {
    target: { value: "RAG audit" },
  });
  fireEvent.change(screen.getByLabelText("Message"), {
    target: { value: "We need retrieval evaluated before launch." },
  });
}

function submitForm() {
  const button = screen.getByRole("button", { name: /send project details/i });
  const form = button.closest("form");
  expect(form).not.toBeNull();
  fireEvent.submit(form as HTMLFormElement);
}

afterEach(() => {
  submitMock.mockReset();
});

describe("ContactForm", () => {
  it("renders the expected fields and submit button", () => {
    render(<ContactForm />);
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Subject")).toBeInTheDocument();
    expect(screen.getByLabelText("Message")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send project details/i })
    ).toBeInTheDocument();
  });

  it("marks every field required for client-side validation", () => {
    render(<ContactForm />);
    expect(screen.getByLabelText("Name")).toBeRequired();
    expect(screen.getByLabelText("Email")).toBeRequired();
    expect(screen.getByLabelText("Subject")).toBeRequired();
    expect(screen.getByLabelText("Message")).toBeRequired();
    expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email");
  });

  /**
   * The form used to carry `required` and nothing else, so an empty submit
   * produced the browser's own bubble and never reached the field-scoped error
   * rendering this component already has. It now validates against
   * `contactFormSchema` — the same object `/api/contact` parses, so a client
   * copy cannot drift from the server's idea of a valid message.
   */
  it("does not post an empty form, and says which field is wrong", async () => {
    render(<ContactForm />);
    submitForm();

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
    expect(submitMock).not.toHaveBeenCalled();
  });

  it("moves focus to the first field that fails client validation", async () => {
    render(<ContactForm />);
    submitForm();

    await waitFor(() => {
      expect(screen.getByLabelText("Name")).toHaveFocus();
    });
  });

  it("does not post when only the email is malformed", async () => {
    render(<ContactForm />);
    fillForm();
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "not-an-address" },
    });
    submitForm();

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
    expect(submitMock).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Email")).toHaveFocus();
  });

  it("carries noValidate so its own errors are the ones a visitor sees", () => {
    render(<ContactForm />);
    const form = screen.getByRole("button", { name: /send project details/i }).closest("form");
    expect(form).toHaveAttribute("novalidate");
  });

  it("posts the form data to /api/contact and shows the success message", async () => {
    submitMock.mockResolvedValueOnce(SENT);
    render(<ContactForm />);

    fillForm();
    submitForm();

    await waitFor(() => {
      expect(screen.getByText(/message sent/i)).toBeInTheDocument();
    });

    expect(submitMock).toHaveBeenCalledTimes(1);
    expect(submitMock).toHaveBeenCalledWith("/api/contact", {
      name: "Ada Lovelace",
      email: "ada@example.com",
      subject: "RAG audit",
      message: "We need retrieval evaluated before launch.",
      contact_ref: "",
      elapsedMs: expect.any(Number),
    });
  });

  /**
   * The signals the human form guard (src/lib/form-guard) judges. A bot
   * driving a browser writes into the DOM, so the honeypot is read from the
   * node, not state; the clock is the time since the form mounted, or since
   * the last success, on the monotonic clock.
   */
  it("sends what a bot typed into the honeypot, and how long the form was open", async () => {
    let now = 1_000;
    const clock = vi.spyOn(performance, "now").mockImplementation(() => now);
    try {
      submitMock.mockResolvedValueOnce(SENT);
      const { container } = render(<ContactForm />);

      fillForm();
      const honeypot = container.querySelector<HTMLInputElement>('input[name="contact_ref"]');
      expect(honeypot).not.toBeNull();
      (honeypot as HTMLInputElement).value = "https://spam.example";
      now = 13_000;
      submitForm();

      await waitFor(() => expect(submitMock).toHaveBeenCalledTimes(1));
      const body = submitMock.mock.calls[0][1] as Record<string, unknown>;
      expect(body.contact_ref).toBe("https://spam.example");
      expect(body.elapsedMs).toBe(12_000);

      // A second message is timed from the first one's success, not from
      // mount, and the honeypot starts empty again.
      await waitFor(() => expect(screen.getByText(/message sent/i)).toBeInTheDocument());
      expect(honeypot).toHaveValue("");
      submitMock.mockResolvedValueOnce(SENT);
      fillForm();
      now = 20_000;
      submitForm();

      await waitFor(() => expect(submitMock).toHaveBeenCalledTimes(2));
      expect((submitMock.mock.calls[1][1] as Record<string, unknown>).elapsedMs).toBe(7_000);
    } finally {
      clock.mockRestore();
    }
  });

  /**
   * BotID wraps fetch and waits on its challenge before the request leaves;
   * a blocked or silent challenge used to leave the button on "Sending..."
   * forever. submitWrite owns the 20s ceiling (pinned in write-chain.test.ts);
   * the form owns saying so and giving the button back.
   */
  it("gives up and says so when the send never answers", async () => {
    submitMock.mockResolvedValueOnce({ kind: "network", cause: "timeout" });
    render(<ContactForm />);

    fillForm();
    submitForm();

    await waitFor(() => {
      expect(screen.getByText(/did not reach the server/i)).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /send project details/i })).toBeEnabled();
  });

  it("keeps the honeypot away from people: hidden, untabbable, never autofilled", () => {
    const { container } = render(<ContactForm />);
    const honeypot = container.querySelector<HTMLInputElement>('input[name="contact_ref"]');

    expect(honeypot).toHaveAttribute("tabindex", "-1");
    expect(honeypot).toHaveAttribute("autocomplete", "off");
    expect(honeypot?.closest('[aria-hidden="true"]')).not.toBeNull();
    // Out of the accessibility tree, so it is not one of the form's fields.
    expect(screen.queryByRole("textbox", { name: "Leave this field empty" })).toBeNull();
  });

  it("clears the fields after a successful submit", async () => {
    submitMock.mockResolvedValueOnce(SENT);
    render(<ContactForm />);

    fillForm();
    submitForm();

    await waitFor(() => {
      expect(screen.getByText(/message sent/i)).toBeInTheDocument();
    });
    expect(screen.getByLabelText("Name")).toHaveValue("");
    expect(screen.getByLabelText("Email")).toHaveValue("");
    expect(screen.getByLabelText("Subject")).toHaveValue("");
    expect(screen.getByLabelText("Message")).toHaveValue("");
  });

  it("relays the server's own reason instead of a generic one", async () => {
    // The API diagnoses each failure separately — a rate limit, a missing mail
    // key, a rejected field, an upstream outage — and this component used to
    // print "Message failed to send. Please try again" over all of them.
    submitMock.mockResolvedValueOnce({
      kind: "server-error",
      status: 500,
      message: "Contact form is temporarily unavailable. Please try again later.",
    });
    render(<ContactForm />);

    fillForm();
    submitForm();

    await waitFor(() => {
      expect(screen.getByText(/temporarily unavailable/i)).toBeInTheDocument();
    });
    // Fields are not cleared on failure: the typed message is the most
    // expensive thing on the page to retype.
    expect(screen.getByLabelText("Name")).toHaveValue("Ada Lovelace");
    expect(screen.getByLabelText("Message")).toHaveValue(
      "We need retrieval evaluated before launch."
    );
  });

  it("puts a field error beside the field it names, not under the button", async () => {
    submitMock.mockResolvedValueOnce({
      kind: "invalid-field",
      field: "email",
      message: "Invalid email format",
    });
    render(<ContactForm />);

    fillForm();
    submitForm();

    await waitFor(() => {
      expect(screen.getByText("Invalid email format")).toBeInTheDocument();
    });

    const email = screen.getByLabelText("Email");
    expect(email).toHaveAttribute("aria-invalid", "true");
    expect(email).toHaveAttribute("aria-describedby", "email-error");
    // Said once, beside the input — not repeated in the status region.
    expect(screen.getAllByText("Invalid email format")).toHaveLength(1);
  });

  it("names a dropped connection as such when the request throws", async () => {
    submitMock.mockResolvedValueOnce({ kind: "network", cause: "unreachable" });
    render(<ContactForm />);

    fillForm();
    submitForm();

    await waitFor(() => {
      expect(screen.getByText(/did not reach the server/i)).toBeInTheDocument();
    });
  });

  /**
   * The server's 429 always says "Too many requests", and the form used to
   * prefer that over its own sentence, so its own sentence, written for this
   * case, was unreachable. The test that covered it mocked a `{}` body.
   */
  it.each([
    [240, "Try again in 4 minutes."],
    [45, "Try again in a minute."],
    [null, "Try again in a few minutes."],
  ])("says a rate limit in its own words, with the wait (retryAfter %s)", async (retryAfter, wait) => {
    submitMock.mockResolvedValueOnce({
      kind: "rate-limited",
      retryAfter,
      message: "Too many requests",
    });
    render(<ContactForm />);

    fillForm();
    submitForm();

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        `Too many messages from this address in a short window. ${wait}`
      );
    });
    expect(screen.queryByText(/^Too many requests/)).not.toBeInTheDocument();
    // Names no field, so the direct address is offered.
    expect(screen.getByRole("link", { name: "lorenzosca7@protonmail.ch" })).toBeInTheDocument();
  });

  it("relays a BotID refusal, and offers the direct address", async () => {
    submitMock.mockResolvedValueOnce({
      kind: "refused",
      status: 403,
      message: "This message was flagged as automated and was not sent.",
    });
    render(<ContactForm />);

    fillForm();
    submitForm();

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/flagged as automated/i);
    });
    expect(screen.getByRole("link", { name: "lorenzosca7@protonmail.ch" })).toBeInTheDocument();
  });

  it("moves focus to the field the failure names", async () => {
    // The field error is wired to its input with aria-describedby, which is
    // only spoken when that input has focus — and after a failed submit focus
    // is still on the submit button, whose status region stays deliberately
    // silent for field-scoped failures. So the form answered a screen-reader
    // user with nothing at all. Focus is the announcement.
    submitMock.mockResolvedValueOnce({
      kind: "invalid-field",
      field: "email",
      message: "Invalid email format",
    });
    render(<ContactForm />);

    fillForm();
    submitForm();

    await waitFor(() => {
      expect(screen.getByLabelText("Email")).toHaveFocus();
    });
    // Focused with the error already committed, so the description is there to
    // be read out in the same utterance.
    expect(screen.getByLabelText("Email")).toHaveAttribute(
      "aria-describedby",
      "email-error"
    );
  });

  it("leaves focus alone when the failure names no field", async () => {
    // Nothing to correct in a particular input, so stealing focus would move
    // the reader away from the form for no reason; the alert carries it.
    submitMock.mockResolvedValueOnce({ kind: "server-error", status: 502, message: null });
    render(<ContactForm />);

    fillForm();
    submitForm();

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/did not send/i);
    });
    expect(screen.getByLabelText("Email")).not.toHaveFocus();
    expect(screen.getByLabelText("Message")).not.toHaveFocus();
  });

  it("announces a failure assertively and a success politely", async () => {
    // A confirmation can wait for a gap in speech; a failure cannot, because
    // the reader is about to walk away believing the message went. Both used
    // one aria-live="polite" region, which queues the failure behind whatever
    // else is speaking.
    submitMock.mockResolvedValueOnce({ kind: "server-error", status: 502, message: null });
    render(<ContactForm />);

    const alert = screen.getByRole("alert");
    const status = screen.getByRole("status");
    expect(alert).toHaveAttribute("aria-live", "assertive");
    expect(status).toHaveAttribute("aria-live", "polite");
    // Both regions are in the tree before either has anything to say: aria-live
    // watches a node for changes, and a region that arrives with its text
    // announces nothing.
    expect(alert).toBeEmptyDOMElement();
    expect(status).toBeEmptyDOMElement();

    fillForm();
    submitForm();

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/did not send/i);
    });
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("puts the confirmation in the polite region, not the alert", async () => {
    submitMock.mockResolvedValueOnce(SENT);
    render(<ContactForm />);

    fillForm();
    submitForm();

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(/message sent/i);
    });
    expect(screen.getByRole("alert")).toBeEmptyDOMElement();
    // The one region both this suite and e2e address by name.
    expect(document.getElementById("contact-form-status")).toHaveTextContent(
      /message sent/i
    );
  });

  it("caps every input at the limit the schema enforces", () => {
    // Without these the only way to learn a message is one character over 5000
    // is to write it, send it, and wait for the round trip that rejects it.
    render(<ContactForm />);
    expect(screen.getByLabelText("Name")).toHaveAttribute(
      "maxlength",
      String(CONTACT_FIELD_LIMITS.name)
    );
    expect(screen.getByLabelText("Email")).toHaveAttribute(
      "maxlength",
      String(CONTACT_FIELD_LIMITS.email)
    );
    expect(screen.getByLabelText("Subject")).toHaveAttribute(
      "maxlength",
      String(CONTACT_FIELD_LIMITS.subject)
    );
    expect(screen.getByLabelText("Message")).toHaveAttribute(
      "maxlength",
      String(CONTACT_FIELD_LIMITS.message)
    );
  });

  it("counts down only once a field is near its limit, and describes the field", () => {
    render(<ContactForm />);
    const message = screen.getByLabelText("Message");

    fireEvent.change(message, { target: { value: "Short." } });
    expect(screen.queryByText(/characters left/)).not.toBeInTheDocument();
    // The field always has a description now: its guidance is rendered as
    // `#message-hint` rather than living in the placeholder, where it vanished
    // on the first keystroke and was never announced. The countdown id joins
    // it only once the countdown exists.
    expect(message).toHaveAttribute("aria-describedby", "message-hint");
    expect(
      screen.getByText(/Share the goal, the users, the data/)
    ).toBeInTheDocument();

    fireEvent.change(message, {
      target: { value: "a".repeat(CONTACT_FIELD_LIMITS.message - 40) },
    });
    expect(screen.getByText("40 characters left")).toBeInTheDocument();
    // In the description rather than a live region: it changes on every
    // keystroke, and a live region updating per character talks over the typist.
    expect(message).toHaveAttribute("aria-describedby", "message-hint message-count");
    expect(document.getElementById("message-count")).not.toHaveAttribute("aria-live");
  });

  it("says what happens past the cap instead of letting a paste vanish", () => {
    // maxLength truncates a long paste without a word. The countdown at zero is
    // the only thing that says so.
    render(<ContactForm />);
    fireEvent.change(screen.getByLabelText("Subject"), {
      target: { value: "a".repeat(CONTACT_FIELD_LIMITS.subject) },
    });

    expect(
      screen.getByText(
        `No characters left. Anything pasted beyond ${CONTACT_FIELD_LIMITS.subject} characters is dropped.`
      )
    ).toBeInTheDocument();
  });

  it("describes a field by both its error and its countdown when it has both", () => {
    submitMock.mockResolvedValueOnce({
      kind: "invalid-field",
      field: "subject",
      message: "Subject is too long",
    });
    render(<ContactForm />);

    fillForm();
    fireEvent.change(screen.getByLabelText("Subject"), {
      target: { value: "a".repeat(CONTACT_FIELD_LIMITS.subject) },
    });
    submitForm();

    return waitFor(() => {
      expect(screen.getByLabelText("Subject")).toHaveAttribute(
        "aria-describedby",
        "subject-error subject-count"
      );
    });
  });

  it("disables the button and shows Sending... while the request is in flight", async () => {
    let resolveSend!: (value: WriteResult<unknown>) => void;
    submitMock.mockImplementationOnce(
      () =>
        new Promise<WriteResult<unknown>>((resolve) => {
          resolveSend = resolve;
        })
    );
    render(<ContactForm />);

    fillForm();
    submitForm();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /sending/i })).toBeDisabled();
    });

    act(() => resolveSend(SENT));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /send project details/i })
      ).toBeEnabled();
    });
  });
});
