import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { ContactForm } from "@/components/contact/ContactForm";
import { CONTACT_FIELD_LIMITS } from "@/lib/validations";

const fetchMock = vi.fn<typeof fetch>();

function jsonResponse(body: unknown, ok = true, status = ok ? 200 : 400): Response {
  return { ok, status, json: async () => body } as Response;
}

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

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
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
    expect(fetchMock).not.toHaveBeenCalled();
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
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Email")).toHaveFocus();
  });

  it("carries noValidate so its own errors are the ones a visitor sees", () => {
    render(<ContactForm />);
    const form = screen.getByRole("button", { name: /send project details/i }).closest("form");
    expect(form).toHaveAttribute("novalidate");
  });

  it("posts the form data to /api/contact and shows the success message", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}));
    render(<ContactForm />);

    fillForm();
    submitForm();

    await waitFor(() => {
      expect(screen.getByText(/message sent/i)).toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/contact");
    expect(init?.method).toBe("POST");
    expect(init?.headers).toEqual({ "Content-Type": "application/json" });
    expect(JSON.parse(String(init?.body))).toEqual({
      name: "Ada Lovelace",
      email: "ada@example.com",
      subject: "RAG audit",
      message: "We need retrieval evaluated before launch.",
    });
  });

  it("clears the fields after a successful submit", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}));
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
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        { error: "Contact form is temporarily unavailable. Please try again later." },
        false,
        500
      )
    );
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
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ error: "Invalid email format", field: "email" }, false, 400)
    );
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
    fetchMock.mockRejectedValueOnce(new Error("network down"));
    render(<ContactForm />);

    fillForm();
    submitForm();

    await waitFor(() => {
      expect(screen.getByText(/never reached the server/i)).toBeInTheDocument();
    });
  });

  it("falls back to its own sentence when the body carries no reason", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}, false, 429));
    render(<ContactForm />);

    fillForm();
    submitForm();

    await waitFor(() => {
      expect(screen.getByText(/too many messages/i)).toBeInTheDocument();
    });
  });

  it("moves focus to the field the failure names", async () => {
    // The field error is wired to its input with aria-describedby, which is
    // only spoken when that input has focus — and after a failed submit focus
    // is still on the submit button, whose status region stays deliberately
    // silent for field-scoped failures. So the form answered a screen-reader
    // user with nothing at all. Focus is the announcement.
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ error: "Invalid email format", field: "email" }, false, 400)
    );
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
    fetchMock.mockResolvedValueOnce(jsonResponse({}, false, 500));
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
    fetchMock.mockResolvedValueOnce(jsonResponse({}, false, 500));
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
    fetchMock.mockResolvedValueOnce(jsonResponse({}));
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
    expect(message).not.toHaveAttribute("aria-describedby");

    fireEvent.change(message, {
      target: { value: "a".repeat(CONTACT_FIELD_LIMITS.message - 40) },
    });
    expect(screen.getByText("40 characters left")).toBeInTheDocument();
    // In the description rather than a live region: it changes on every
    // keystroke, and a live region updating per character talks over the typist.
    expect(message).toHaveAttribute("aria-describedby", "message-count");
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
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ error: "Subject is too long", field: "subject" }, false, 400)
    );
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
    let resolveFetch!: (value: Response) => void;
    fetchMock.mockImplementationOnce(
      () =>
        new Promise<Response>((resolve) => {
          resolveFetch = resolve;
        })
    );
    render(<ContactForm />);

    fillForm();
    submitForm();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /sending/i })).toBeDisabled();
    });

    act(() => resolveFetch(jsonResponse({})));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /send project details/i })
      ).toBeEnabled();
    });
  });
});
