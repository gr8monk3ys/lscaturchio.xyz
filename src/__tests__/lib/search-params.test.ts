import { describe, it, expect } from "vitest";
import {
  readEnumParam,
  readPageParam,
  readSearchParam,
} from "@/lib/search-params";

describe("readSearchParam", () => {
  it("reads a plain value", () => {
    expect(readSearchParam({ tag: "labor" }, "tag")).toBe("labor");
  });

  it("takes the first value of a repeated parameter", () => {
    expect(readSearchParam({ tag: ["labor", "ai"] }, "tag")).toBe("labor");
  });

  it("reads absent and empty-array parameters as an empty string", () => {
    expect(readSearchParam({}, "tag")).toBe("");
    expect(readSearchParam({ tag: undefined }, "tag")).toBe("");
    expect(readSearchParam({ tag: [] }, "tag")).toBe("");
  });
});

describe("readPageParam", () => {
  it("reads a positive page", () => {
    expect(readPageParam({ page: "3" })).toBe(3);
  });

  it("falls back to page 1 rather than showing an empty list", () => {
    for (const value of ["0", "-2", "abc", "", undefined]) {
      expect(readPageParam({ page: value })).toBe(1);
    }
    expect(readPageParam({})).toBe(1);
  });

  it("takes the leading integer of a decimal", () => {
    expect(readPageParam({ page: "2.9" })).toBe(2);
  });
});

describe("readEnumParam", () => {
  const allowed = ["featured", "newest", "oldest", "name"] as const;

  it("accepts an allowed value", () => {
    expect(readEnumParam({ sort: "newest" }, "sort", allowed, "featured")).toBe(
      "newest"
    );
  });

  it("rejects anything else, including a near miss", () => {
    for (const value of ["Newest", "sideways", "", undefined]) {
      expect(readEnumParam({ sort: value }, "sort", allowed, "featured")).toBe(
        "featured"
      );
    }
  });

  it("narrows a repeated parameter by its first value", () => {
    expect(
      readEnumParam({ sort: ["name", "newest"] }, "sort", allowed, "featured")
    ).toBe("name");
  });
});
