import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { NewsletterForm } from "@/components/newsletter/newsletter-form";
import { NEWSLETTER_TOPICS } from "@/constants/newsletter";

const fetchMock = vi.fn<typeof fetch>();

function jsonResponse(body: unknown, ok = true): Response {
  return { ok, json: async () => body } as Response;
}

function fillEmail(value = "reader@example.com") {
  fireEvent.change(screen.getByLabelText("Email address"), {
    target: { value },
  });
}

function submitForm() {
  const button = screen.getByRole("button", { name: /subscribe/i });
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

describe("NewsletterForm", () => {
  it("renders the email input, subscribe button, and all topic toggles", () => {
    render(<NewsletterForm />);
    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Subscribe" })).toBeInTheDocument();
    for (const topic of NEWSLETTER_TOPICS) {
      expect(screen.getByRole("button", { name: topic.label })).toBeInTheDocument();
    }
    expect(screen.getByText("0/6")).toBeInTheDocument();
  });

  it("requires the email field for client-side validation", () => {
    render(<NewsletterForm />);
    const input = screen.getByLabelText("Email address");
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("type", "email");
  });

  it("toggles a topic on and off and updates the counter", () => {
    render(<NewsletterForm />);
    const topic = screen.getByRole("button", { name: "RAG + LLM Systems" });
    expect(topic).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(topic);
    expect(topic).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("1/6")).toBeInTheDocument();

    fireEvent.click(topic);
    expect(topic).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText("0/6")).toBeInTheDocument();
  });

  it("pre-selects valid defaultTopics and drops unknown ones", () => {
    render(<NewsletterForm defaultTopics={["rag-llms", "not-a-topic", "ai-society"]} />);
    expect(
      screen.getByRole("button", { name: "RAG + LLM Systems" })
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", { name: "AI + Society" })
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("2/6")).toBeInTheDocument();
  });

  it("posts email, topics, and source to the subscribe endpoint", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ message: "Welcome aboard!" }));
    render(<NewsletterForm sourcePath="/blog/some-post" />);

    fillEmail();
    fireEvent.click(screen.getByRole("button", { name: "Systems + Craft" }));
    submitForm();

    await waitFor(() => {
      expect(screen.getByText("Welcome aboard!")).toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/newsletter/subscribe");
    expect(init?.method).toBe("POST");
    expect(init?.headers).toEqual({ "Content-Type": "application/json" });
    expect(JSON.parse(String(init?.body))).toEqual({
      email: "reader@example.com",
      topics: ["systems-craft"],
      source: "/blog/some-post",
    });
  });

  it("shows success state, clears the email, and disables controls after subscribing", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ message: "Successfully subscribed!" }));
    render(<NewsletterForm />);

    fillEmail();
    submitForm();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /subscribed!/i })).toBeInTheDocument();
    });
    expect(screen.getByText("Successfully subscribed!")).toBeInTheDocument();
    expect(screen.getByLabelText("Email address")).toHaveValue("");
    expect(screen.getByLabelText("Email address")).toBeDisabled();
    expect(screen.getByRole("button", { name: /subscribed!/i })).toBeDisabled();
  });

  it("shows the server error message when the response is not ok", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: "Email already subscribed" }, false));
    render(<NewsletterForm />);

    fillEmail();
    submitForm();

    await waitFor(() => {
      expect(screen.getByText("Email already subscribed")).toBeInTheDocument();
    });
    // The email is kept so the visitor can retry.
    expect(screen.getByLabelText("Email address")).toHaveValue("reader@example.com");
    expect(screen.getByRole("button", { name: "Subscribe" })).toBeEnabled();
  });

  it("shows a network error message when the request throws", async () => {
    fetchMock.mockRejectedValueOnce(new Error("offline"));
    render(<NewsletterForm />);

    fillEmail();
    submitForm();

    await waitFor(() => {
      expect(screen.getByText("Network error. Please try again.")).toBeInTheDocument();
    });
  });

  it("shows Subscribing... and disables the form while the request is in flight", async () => {
    let resolveFetch!: (value: Response) => void;
    fetchMock.mockImplementationOnce(
      () =>
        new Promise<Response>((resolve) => {
          resolveFetch = resolve;
        })
    );
    render(<NewsletterForm />);

    fillEmail();
    submitForm();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /subscribing/i })).toBeDisabled();
    });
    expect(screen.getByLabelText("Email address")).toBeDisabled();

    act(() => resolveFetch(jsonResponse({ message: "Done" })));

    await waitFor(() => {
      expect(screen.getByText("Done")).toBeInTheDocument();
    });
  });
});
