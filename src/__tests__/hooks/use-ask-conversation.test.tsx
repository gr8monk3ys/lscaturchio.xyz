import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useAskConversation, ASK_OPENER } from "@/hooks/use-ask-conversation";

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function ok(answer: string) {
  return { ok: true, json: async () => ({ data: { answer } }) };
}

describe("useAskConversation", () => {
  it("starts with the opener and reports itself empty", () => {
    const { result } = renderHook(() => useAskConversation());
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].content).toBe(ASK_OPENER);
    expect(result.current.isEmpty).toBe(true);
  });

  it("appends the question and the answer", async () => {
    fetchMock.mockResolvedValue(ok("Because capacity demands to be used."));
    const { result } = renderHook(() => useAskConversation());

    await act(async () => {
      await result.current.send("Why does the machine keep running?");
    });

    await waitFor(() => expect(result.current.messages).toHaveLength(3));
    expect(result.current.messages[1]).toMatchObject({
      sender: "user",
      content: "Why does the machine keep running?",
    });
    expect(result.current.messages[2]).toMatchObject({
      sender: "ai",
      content: "Because capacity demands to be used.",
    });
    expect(result.current.isEmpty).toBe(false);
  });

  it("passes the essay slug so answers can be grounded in what is being read", async () => {
    fetchMock.mockResolvedValue(ok("yes"));
    const { result } = renderHook(() =>
      useAskConversation({ contextSlug: "strikes-work" })
    );

    await act(async () => {
      await result.current.send("Does this hold up?");
    });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.contextSlug).toBe("strikes-work");
  });

  it("omits the slug entirely when there is no essay in view", async () => {
    fetchMock.mockResolvedValue(ok("yes"));
    const { result } = renderHook(() => useAskConversation());

    await act(async () => {
      await result.current.send("Anything");
    });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.contextSlug).toBeUndefined();
  });

  it("keeps the failed question so the reader can resend it", async () => {
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({ error: "boom" }) });
    const { result } = renderHook(() => useAskConversation());

    await act(async () => {
      await result.current.send("What broke?");
    });

    await waitFor(() => expect(result.current.messages).toHaveLength(3));
    expect(result.current.messages[2].failedQuery).toBe("What broke?");
  });

  it("treats a 200 with no answer as a failure rather than rendering nothing", async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ data: {} }) });
    const { result } = renderHook(() => useAskConversation());

    await act(async () => {
      await result.current.send("Empty?");
    });

    await waitFor(() => expect(result.current.messages).toHaveLength(3));
    expect(result.current.messages[2].failedQuery).toBe("Empty?");
  });

  it("ignores an empty or whitespace-only question", async () => {
    const { result } = renderHook(() => useAskConversation());

    await act(async () => {
      await result.current.send("   ");
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.messages).toHaveLength(1);
  });

  it("returns to the opener on reset", async () => {
    fetchMock.mockResolvedValue(ok("an answer"));
    const { result } = renderHook(() => useAskConversation());

    await act(async () => {
      await result.current.send("a question");
    });
    await waitFor(() => expect(result.current.isEmpty).toBe(false));

    act(() => result.current.reset());

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].content).toBe(ASK_OPENER);
    expect(result.current.isEmpty).toBe(true);
    expect(result.current.input).toBe("");
  });

  it("prefills the composer from an initial query without sending it", () => {
    const { result } = renderHook(() =>
      useAskConversation({ initialQuery: "seeded question" })
    );
    expect(result.current.input).toBe("seeded question");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
