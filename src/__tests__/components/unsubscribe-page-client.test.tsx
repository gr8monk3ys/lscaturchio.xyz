import { afterEach, describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { UnsubscribePageClient } from "@/components/pages/unsubscribe-page-client";

describe("UnsubscribePageClient", () => {
  it("renders the success state with message and both navigation links", () => {
    render(
      <UnsubscribePageClient status="success" message="You have been unsubscribed." />
    );

    expect(
      screen.getByRole("heading", { name: "Unsubscribed Successfully" })
    ).toBeInTheDocument();
    expect(screen.getByText("You have been unsubscribed.")).toBeInTheDocument();
    expect(screen.getByText(/removed from my newsletter/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to Home" })).toHaveAttribute(
      "href",
      "/"
    );
    expect(screen.getByRole("link", { name: "Browse Blog" })).toHaveAttribute(
      "href",
      "/blog"
    );
  });

  it("renders the error state without the blog link", () => {
    render(
      <UnsubscribePageClient status="error" message="Something went wrong." />
    );

    expect(
      screen.getByRole("heading", { name: "Unsubscribe Failed" })
    ).toBeInTheDocument();
    expect(screen.getByText("Something went wrong.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to Home" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Browse Blog" })).not.toBeInTheDocument();
    expect(screen.queryByText(/removed from my newsletter/i)).not.toBeInTheDocument();
  });

  it("renders the no-token state as an invalid link", () => {
    render(
      <UnsubscribePageClient status="no-token" message="This link is missing a token." />
    );

    expect(screen.getByRole("heading", { name: "Invalid Link" })).toBeInTheDocument();
    expect(screen.getByText("This link is missing a token.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to Home" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Browse Blog" })).not.toBeInTheDocument();
  });

  describe("confirm state", () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("unsubscribes only when the reader presses the button", async () => {
      const fetchMock = vi.fn(async () =>
        new Response(
          JSON.stringify({ data: { message: "Successfully unsubscribed" }, success: true }),
          { status: 200 }
        )
      );
      vi.stubGlobal("fetch", fetchMock);

      render(<UnsubscribePageClient status="confirm" message="" token="tok-123" />);

      expect(fetchMock).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole("button", { name: "Unsubscribe" }));

      await waitFor(() =>
        expect(screen.getByRole("heading", { name: "Unsubscribed Successfully" })).toBeInTheDocument()
      );
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/newsletter/unsubscribe",
        expect.objectContaining({ method: "POST", body: JSON.stringify({ token: "tok-123" }) })
      );
      expect(screen.getByText("Successfully unsubscribed")).toBeInTheDocument();
    });

    it("shows the server's error when the request is refused", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn(async () =>
          new Response(JSON.stringify({ error: "Invalid unsubscribe token", success: false }), {
            status: 404,
          })
        )
      );

      render(<UnsubscribePageClient status="confirm" message="" token="bad" />);
      fireEvent.click(screen.getByRole("button", { name: "Unsubscribe" }));

      await waitFor(() =>
        expect(screen.getByRole("heading", { name: "Unsubscribe Failed" })).toBeInTheDocument()
      );
      expect(screen.getByText("Invalid unsubscribe token")).toBeInTheDocument();
    });

    it("says so when the request never reaches the server", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn(async () => {
          throw new TypeError("Failed to fetch");
        })
      );

      render(<UnsubscribePageClient status="confirm" message="" token="tok-123" />);
      fireEvent.click(screen.getByRole("button", { name: "Unsubscribe" }));

      await waitFor(() =>
        expect(screen.getByText("Network error. Please try again later.")).toBeInTheDocument()
      );
      expect(screen.getByRole("heading", { name: "Unsubscribe Failed" })).toBeInTheDocument();
    });
  });
});
