import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { ContactForm } from "@/components/contact/ContactForm";

const fetchMock = vi.fn<typeof fetch>();

function jsonResponse(body: unknown, ok = true): Response {
  return { ok, json: async () => body } as Response;
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

  it("shows the error message when the server responds with a failure", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}, false));
    render(<ContactForm />);

    fillForm();
    submitForm();

    await waitFor(() => {
      expect(screen.getByText(/message failed to send/i)).toBeInTheDocument();
    });
    // Fields are not cleared on failure.
    expect(screen.getByLabelText("Name")).toHaveValue("Ada Lovelace");
  });

  it("shows the error message when the request throws", async () => {
    fetchMock.mockRejectedValueOnce(new Error("network down"));
    render(<ContactForm />);

    fillForm();
    submitForm();

    await waitFor(() => {
      expect(screen.getByText(/message failed to send/i)).toBeInTheDocument();
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
