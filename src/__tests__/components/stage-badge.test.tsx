import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StageBadge } from "@/components/blog/stage-badge";

describe("StageBadge", () => {
  it("renders the uppercase stage label when set", () => {
    render(<StageBadge stage="evergreen" />);
    expect(screen.getByText("EVERGREEN")).toBeInTheDocument();
  });

  it("renders nothing when stage is undefined", () => {
    const { container } = render(<StageBadge />);
    expect(container).toBeEmptyDOMElement();
  });
});
