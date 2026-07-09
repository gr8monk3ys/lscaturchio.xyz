import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { CodeBlock } from "@/components/blog/code-block";

const writeText = vi.fn();

describe("CodeBlock", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    writeText.mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the code content", () => {
    render(
      <CodeBlock className="language-typescript">
        <code>const x = 1;</code>
      </CodeBlock>
    );

    expect(screen.getByText("const x = 1;")).toBeInTheDocument();
  });

  it("shows the mapped language label from the className", () => {
    render(
      <CodeBlock className="language-tsx">
        <code>{"<App />"}</code>
      </CodeBlock>
    );

    expect(screen.getByText("TypeScript (React)")).toBeInTheDocument();
  });

  it("falls back to an uppercase label for unknown languages", () => {
    render(
      <CodeBlock className="language-brainfuck">
        <code>+++</code>
      </CodeBlock>
    );

    expect(screen.getByText("BRAINFUCK")).toBeInTheDocument();
  });

  it("labels blocks without a language class as plain text", () => {
    render(
      <CodeBlock>
        <code>just words</code>
      </CodeBlock>
    );

    expect(screen.getByText("Plain Text")).toBeInTheDocument();
  });

  it("prefers the filename over the language label when provided", () => {
    render(
      <CodeBlock className="language-typescript" filename="example.ts">
        <code>const x = 1;</code>
      </CodeBlock>
    );

    expect(screen.getByText("example.ts")).toBeInTheDocument();
    expect(screen.queryByText("TypeScript")).not.toBeInTheDocument();
  });

  it("shows a singular or plural line count", () => {
    const { unmount } = render(
      <CodeBlock className="language-js">
        <code>single();</code>
      </CodeBlock>
    );
    expect(screen.getByText("1 line")).toBeInTheDocument();
    unmount();

    render(
      <CodeBlock className="language-js">
        <code>{"a();\nb();\nc();"}</code>
      </CodeBlock>
    );
    expect(screen.getByText("3 lines")).toBeInTheDocument();
  });

  it("copies the code text and reverts the button label after the timeout", async () => {
    vi.useFakeTimers();
    render(
      <CodeBlock className="language-js">
        <code>{"const answer = 42;"}</code>
      </CodeBlock>
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy code to clipboard" }));
    });

    expect(writeText).toHaveBeenCalledWith("const answer = 42;");
    expect(screen.getByText("Copied!")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.queryByText("Copied!")).not.toBeInTheDocument();
    expect(screen.getByText("Copy")).toBeInTheDocument();
  });

  it("falls back to execCommand when the clipboard API fails", async () => {
    writeText.mockRejectedValue(new Error("denied"));
    const execCommand = vi.fn(() => true);
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      writable: true,
      value: execCommand,
    });

    render(
      <CodeBlock className="language-js">
        <code>{"fallback();"}</code>
      </CodeBlock>
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy code to clipboard" }));
    });

    expect(execCommand).toHaveBeenCalledWith("copy");
    expect(screen.getByText("Copied!")).toBeInTheDocument();
  });

  it("collapses long code blocks and toggles with the expand button", () => {
    const longCode = Array.from({ length: 25 }, (_, i) => `line${i + 1}();`).join("\n");
    render(
      <CodeBlock className="language-js">
        <code>{longCode}</code>
      </CodeBlock>
    );

    const toggle = screen.getByRole("button", { name: /Show 5 more lines/ });
    expect(toggle).toBeInTheDocument();

    fireEvent.click(toggle);
    expect(screen.getByRole("button", { name: /Show less/ })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Show less/ }));
    expect(screen.getByRole("button", { name: /Show 5 more lines/ })).toBeInTheDocument();
  });

  it("does not show an expand button for short code", () => {
    render(
      <CodeBlock className="language-js">
        <code>{"short();"}</code>
      </CodeBlock>
    );

    expect(screen.queryByRole("button", { name: /more lines/ })).not.toBeInTheDocument();
  });

  it("toggles line numbers via the header button", () => {
    render(
      <CodeBlock className="language-js">
        <code>{"a();\nb();\nc();"}</code>
      </CodeBlock>
    );

    // Line numbers are on by default.
    expect(screen.getByText("2")).toBeInTheDocument();

    const toggle = screen.getByRole("button", { name: "Hide line numbers" });
    fireEvent.click(toggle);

    expect(screen.getByRole("button", { name: "Show line numbers" })).toBeInTheDocument();
    expect(screen.queryByText("2")).not.toBeInTheDocument();
  });

  it("respects showLineNumbers={false}", () => {
    render(
      <CodeBlock className="language-js" showLineNumbers={false}>
        <code>{"a();\nb();"}</code>
      </CodeBlock>
    );

    expect(screen.getByRole("button", { name: "Show line numbers" })).toBeInTheDocument();
    expect(screen.queryByText("1")).not.toBeInTheDocument();
  });
});
