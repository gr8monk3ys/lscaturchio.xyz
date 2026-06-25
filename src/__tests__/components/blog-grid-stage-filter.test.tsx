import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BlogGrid } from "@/components/blog/BlogGrid";

const minimalProps = {
  blogs: [] as Parameters<typeof BlogGrid>[0]["blogs"],
  totalBlogs: 0,
  currentPage: 1,
  pageStart: 0,
  totalPages: 1,
};

describe("BlogGrid stage filter nav", () => {
  it("renders an All link plus the three stage links", () => {
    render(<BlogGrid {...minimalProps} />);
    expect(screen.getByRole("link", { name: "All" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "SEEDLING" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "BUDDING" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "EVERGREEN" })).toBeInTheDocument();
  });

  it("marks the EVERGREEN link aria-current=page when stageFilter=evergreen and All is not marked", () => {
    render(<BlogGrid {...minimalProps} stageFilter="evergreen" />);
    const evergreenLink = screen.getByRole("link", { name: "EVERGREEN" });
    const allLink = screen.getByRole("link", { name: "All" });
    expect(evergreenLink).toHaveAttribute("aria-current", "page");
    expect(allLink).not.toHaveAttribute("aria-current");
  });

  it("marks All aria-current=page when no stageFilter is provided", () => {
    render(<BlogGrid {...minimalProps} />);
    const allLink = screen.getByRole("link", { name: "All" });
    expect(allLink).toHaveAttribute("aria-current", "page");
    // No stage link should be current
    expect(screen.getByRole("link", { name: "SEEDLING" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "BUDDING" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "EVERGREEN" })).not.toHaveAttribute("aria-current");
  });

  it("marks All aria-current=page when stageFilter is an invalid value", () => {
    render(<BlogGrid {...minimalProps} stageFilter="invalid-stage" />);
    expect(screen.getByRole("link", { name: "All" })).toHaveAttribute("aria-current", "page");
  });

  it("preserves an active tagFilter in each stage link href", () => {
    render(<BlogGrid {...minimalProps} tagFilter="rag" />);
    const evergreenLink = screen.getByRole("link", { name: "EVERGREEN" });
    const href = evergreenLink.getAttribute("href") ?? "";
    expect(href).toContain("tag=rag");
    expect(href).toContain("stage=evergreen");
  });
});
