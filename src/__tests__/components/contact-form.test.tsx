import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { ContactForm } from "@/components/contact/ContactForm";

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
