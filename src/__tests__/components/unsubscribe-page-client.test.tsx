import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
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
});
