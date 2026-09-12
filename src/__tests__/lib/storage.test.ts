import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { safeStorage } from "@/lib/storage";

/**
 * `safeStorage` exists because every one of these calls can throw.
 *
 * A browser in private mode, a browser configured to block site data, a
 * thumbnail capture, or a full quota all raise on plain `localStorage` access
 * — not on write alone, but on *read* too. The whole value of this module is
 * the catch, so the catch is what these tests exercise: each operation is
 * checked for both the happy path and a throwing accessor, since an
 * untested catch block is indistinguishable from a missing one.
 */
vi.mock("@/lib/logger", () => ({
  logError: vi.fn(),
  logWarn: vi.fn(),
}));

/**
 * An in-memory store, because this environment has none.
 *
 * vitest warns "localStorage is not available because --localstorage-file was
 * not provided", so relying on the ambient one made every happy-path
 * assertion return false — the module's own guard was doing its job and the
 * test was wrong. Installing a real implementation here keeps the two cases
 * honest: this store for the paths that should succeed, a throwing one for the
 * catch blocks.
 */
function memoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => (map.has(k) ? map.get(k)! : null),
    setItem: (k: string, v: string) => void map.set(k, String(v)),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
  };
}

function install(value: unknown) {
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value });
}

function withThrowingStorage(fn: () => void) {
  const boom = () => {
    throw new DOMException("QuotaExceededError");
  };
  install({ getItem: boom, setItem: boom, removeItem: boom });
  try {
    fn();
  } finally {
    install(memoryStorage());
  }
}

beforeEach(() => {
  install(memoryStorage());
});

afterEach(() => {
  install(memoryStorage());
});

describe("safeStorage strings", () => {
  it("round-trips a value", () => {
    expect(safeStorage.set("k", "v")).toBe(true);
    expect(safeStorage.get("k")).toBe("v");
  });

  it("returns null for a key that was never set", () => {
    expect(safeStorage.get("absent")).toBeNull();
  });

  it("removes a value", () => {
    safeStorage.set("k", "v");
    expect(safeStorage.remove("k")).toBe(true);
    expect(safeStorage.get("k")).toBeNull();
  });

  it("returns null rather than throwing when the accessor throws", () => {
    withThrowingStorage(() => {
      expect(safeStorage.get("k")).toBeNull();
    });
  });

  it("returns false rather than throwing when set throws", () => {
    withThrowingStorage(() => {
      expect(safeStorage.set("k", "v")).toBe(false);
    });
  });

  it("returns false rather than throwing when remove throws", () => {
    withThrowingStorage(() => {
      expect(safeStorage.remove("k")).toBe(false);
    });
  });
});

describe("safeStorage JSON", () => {
  it("round-trips a structure", () => {
    expect(safeStorage.setJSON("j", { a: [1, 2], b: "x" })).toBe(true);
    expect(safeStorage.getJSON<{ a: number[]; b: string }>("j")).toEqual({ a: [1, 2], b: "x" });
  });

  it("returns null for an absent key", () => {
    expect(safeStorage.getJSON("absent")).toBeNull();
  });

  it("returns null for stored text that is not JSON", () => {
    // The realistic corruption case: a value written by an older version, or
    // by something else on the origin.
    safeStorage.set("j", "{not json");
    expect(safeStorage.getJSON("j")).toBeNull();
  });

  it("treats an empty string as absent rather than parsing it", () => {
    safeStorage.set("j", "");
    expect(safeStorage.getJSON("j")).toBeNull();
  });

  it("returns false when the value cannot be serialised", () => {
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    expect(safeStorage.setJSON("j", cyclic)).toBe(false);
  });

  it("returns null rather than throwing when getJSON's accessor throws", () => {
    withThrowingStorage(() => {
      expect(safeStorage.getJSON("j")).toBeNull();
    });
  });

  it("returns false rather than throwing when setJSON's accessor throws", () => {
    withThrowingStorage(() => {
      expect(safeStorage.setJSON("j", { a: 1 })).toBe(false);
    });
  });
});
