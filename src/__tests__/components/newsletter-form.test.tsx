import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { NewsletterForm } from "@/components/newsletter/newsletter-form";
import { NEWSLETTER_TOPICS } from "@/constants/newsletter";

const fetchMock = vi.fn<typeof fetch>();

const JSON_HEADERS = { "content-type": "application/json" };

/** What apiSuccess sends: { data, success: true }. */
function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify({ data: body, success: true }), {
    status: 200,
    headers: JSON_HEADERS,
  });
}

/** What apiError sends: { error, success: false, ...details }, no `data`. */
function jsonErrorResponse(status: number, error: string, details: object = {}): Response {
  return new Response(JSON.stringify({ error, success: false, ...details }), {
    status,
    headers: JSON_HEADERS,
  });
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
    expect(screen.getByText("Topics (optional)")).toBeInTheDocument();
  });

  it("requires the email field for client-side validation", () => {
    render(<NewsletterForm />);
    const input = screen.getByLabelText("Email address");
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("type", "email");
  });

  it("toggles a topic on and off", () => {
    render(<NewsletterForm />);
    const topic = screen.getByRole("button", { name: "RAG + LLM Systems" });
    expect(topic).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(topic);
    expect(topic).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(topic);
    expect(topic).toHaveAttribute("aria-pressed", "false");
  });

  it("pre-selects valid defaultTopics and drops unknown ones", () => {
    render(<NewsletterForm defaultTopics={["rag-llms", "not-a-topic", "ai-society"]} />);
    expect(
      screen.getByRole("button", { name: "RAG + LLM Systems" })
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", { name: "AI + Society" })
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", { name: "Systems + Craft" })
    ).toHaveAttribute("aria-pressed", "false");
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
      contact_ref: "",
      elapsedMs: expect.any(Number),
    });
  });

  /**
   * The route runs the human form guard (src/lib/form-guard/guard.ts). A bot
   * driving a browser writes into the DOM, so the honeypot is read from the
   * node; the clock is the time since the form mounted, on the monotonic clock.
   */
  it("sends the honeypot and how long the form was open, and resets both after a success", async () => {
    let now = 1_000;
    const clock = vi.spyOn(performance, "now").mockImplementation(() => now);
    try {
      fetchMock.mockResolvedValueOnce(jsonResponse({ message: "Welcome aboard!" }));
      const { container } = render(<NewsletterForm />);

      const honeypot = container.querySelector<HTMLInputElement>('input[name="contact_ref"]');
      expect(honeypot).not.toBeNull();
      expect(honeypot).toHaveAttribute("tabindex", "-1");
      expect(honeypot?.closest('[aria-hidden="true"]')).not.toBeNull();
      (honeypot as HTMLInputElement).value = "https://spam.example";

      fillEmail();
      now = 9_500;
      submitForm();

      await waitFor(() => expect(screen.getByText("Welcome aboard!")).toBeInTheDocument());
      const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
      expect(body.contact_ref).toBe("https://spam.example");
      expect(body.elapsedMs).toBe(8_500);
      expect(honeypot).toHaveValue("");
    } finally {
      clock.mockRestore();
    }
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

  // The route answers every subscribe outcome alike so it is not a membership
  // oracle; there is no "already subscribed" failure to mock. These are the
  // failures it does send.
  it.each([
    ["the schema", jsonErrorResponse(400, "Invalid email format", { field: "email" }), "Invalid email format"],
    ["the rate limit", jsonErrorResponse(429, "Too many requests", { retryAfter: 300 }), "Too many requests"],
    ["CSRF", jsonErrorResponse(403, "Invalid origin"), "Invalid origin"],
  ])("shows the server's reason when %s refuses", async (_layer, response, reason) => {
    fetchMock.mockResolvedValueOnce(response);
    render(<NewsletterForm />);

    fillEmail();
    submitForm();

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(reason);
    });
    // The email is kept so the visitor can retry.
    expect(screen.getByLabelText("Email address")).toHaveValue("reader@example.com");
    expect(screen.getByRole("button", { name: "Subscribe" })).toBeEnabled();
  });

  it("does not call a server error page a network error", async () => {
    // A gateway's HTML 502 made `response.json()` throw, and the catch said
    // "Network error" about a request that had reached a server.
    fetchMock.mockResolvedValueOnce(
      new Response("<html>502 Bad Gateway</html>", {
        status: 502,
        headers: { "content-type": "text/html" },
      })
    );
    render(<NewsletterForm />);

    fillEmail();
    submitForm();

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Failed to subscribe");
    });
    expect(screen.queryByText(/network error/i)).not.toBeInTheDocument();
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
