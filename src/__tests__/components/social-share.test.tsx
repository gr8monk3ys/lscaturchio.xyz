import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { SocialShare } from "@/components/blog/social-share";
import { logError } from "@/lib/logger";

vi.mock("@/lib/logger", () => ({
  logError: vi.fn(),
}));

const props = {
  title: "Nihilism Is Lazy Philosophy",
  description: "Nothing matters is the intellectual equivalent of not voting.",
  url: "https://lscaturchio.xyz/blog/nihilism-is-lazy",
};

const writeText = vi.fn();
let openSpy: ReturnType<typeof vi.spyOn>;

describe("SocialShare", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    writeText.mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
  });

  afterEach(() => {
    openSpy.mockRestore();
    Reflect.deleteProperty(navigator, "share");
    vi.useRealTimers();
  });

  it("opens the Twitter intent URL with encoded title and url", () => {
    render(<SocialShare {...props} />);

    fireEvent.click(screen.getByRole("button", { name: "Share on Twitter" }));

    expect(openSpy).toHaveBeenCalledWith(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        props.title
      )}&url=${encodeURIComponent(props.url)}`,
      "_blank",
      "noopener,noreferrer"
    );
  });

  it("opens the LinkedIn share URL with the encoded url", () => {
    render(<SocialShare {...props} />);

    fireEvent.click(screen.getByRole("button", { name: "Share on LinkedIn" }));

    expect(openSpy).toHaveBeenCalledWith(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(props.url)}`,
      "_blank",
      "noopener,noreferrer"
    );
  });

  it("opens the Bluesky compose URL with title and url in the text", () => {
    render(<SocialShare {...props} />);

    fireEvent.click(screen.getByRole("button", { name: "Share on Bluesky" }));

    expect(openSpy).toHaveBeenCalledWith(
      `https://bsky.app/intent/compose?text=${encodeURIComponent(
        `${props.title}\n${props.url}`
      )}`,
      "_blank",
      "noopener,noreferrer"
    );
  });

  it("opens the Hacker News submit URL with encoded url and title", () => {
    render(<SocialShare {...props} />);

    fireEvent.click(screen.getByRole("button", { name: "Share on Hacker News" }));

    expect(openSpy).toHaveBeenCalledWith(
      `https://news.ycombinator.com/submitlink?u=${encodeURIComponent(
        props.url
      )}&t=${encodeURIComponent(props.title)}`,
      "_blank",
      "noopener,noreferrer"
    );
  });

  it("copies the share URL and shows Copied! until the timeout elapses", async () => {
    vi.useFakeTimers();
    render(<SocialShare {...props} />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy link" }));
    });

    expect(writeText).toHaveBeenCalledWith(props.url);
    expect(screen.getByText("Copied!")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.queryByText("Copied!")).not.toBeInTheDocument();
    expect(screen.getByText("Copy Link")).toBeInTheDocument();
  });

  it("logs the error and keeps the default label when clipboard write fails", async () => {
    writeText.mockRejectedValue(new Error("denied"));
    render(<SocialShare {...props} />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy link" }));
    });

    expect(logError).toHaveBeenCalledWith(
      "Failed to copy link",
      expect.any(Error),
      { component: "SocialShare" }
    );
    expect(screen.queryByText("Copied!")).not.toBeInTheDocument();
    expect(screen.getByText("Copy Link")).toBeInTheDocument();
  });

  it("hides the native share button when navigator.share is unavailable", () => {
    render(<SocialShare {...props} />);

    expect(
      screen.queryByRole("button", { name: "Share via native share" })
    ).not.toBeInTheDocument();
  });

  it("renders the native share button and shares title, text, and url", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: share,
    });

    render(<SocialShare {...props} />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Share via native share" }));
    });

    expect(share).toHaveBeenCalledWith({
      title: props.title,
      text: props.description,
      url: props.url,
    });
  });
});
