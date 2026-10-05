"use client";

import { useEffect, useId, useRef } from "react";
import { ELAPSED_FIELD, HONEYPOT_FIELD } from "@/lib/form-guard/shared";

/**
 * The browser's half of the human form guard (src/lib/form-guard/guard.ts):
 * the honeypot input, and how long the form has been open.
 *
 * ```tsx
 * const guard = useFormGuard();
 * submitWrite(url, { ...fields, ...guard.fields() });  // on submit
 * guard.reset();                                        // after a success
 * <form>... {guard.honeypot} ...</form>
 * ```
 *
 * The honeypot is uncontrolled on purpose: a browser-driving bot writes to
 * the DOM, not to React state, and reading the node is what sees it. The
 * clock starts at mount and restarts on `reset`, so a second submission is
 * timed too. `performance.now()` rather than `Date.now()`: the wall clock can
 * be corrected backwards while someone types, and a negative interval would
 * read as a bot and drop their submission without a word.
 */
export function useFormGuard() {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const openedAt = useRef(0);

  useEffect(() => {
    openedAt.current = performance.now();
  }, []);

  // Off-screen rather than `display: none`, which form bots check for;
  // hidden from assistive tech and out of the tab order, so no person reaches
  // it. The label is for the one who somehow does.
  const honeypot = (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label htmlFor={id}>Leave this field empty</label>
      <input
        ref={inputRef}
        type="text"
        id={id}
        name={HONEYPOT_FIELD}
        tabIndex={-1}
        autoComplete="off"
        defaultValue=""
      />
    </div>
  );

  return {
    honeypot,
    /** The guard's fields, to spread into the request body at submit time. */
    fields: () => ({
      [HONEYPOT_FIELD]: inputRef.current?.value ?? "",
      [ELAPSED_FIELD]: Math.round(performance.now() - openedAt.current),
    }),
    /** After a successful send: the next submission is timed from now. */
    reset: () => {
      if (inputRef.current) inputRef.current.value = "";
      openedAt.current = performance.now();
    },
  };
}
