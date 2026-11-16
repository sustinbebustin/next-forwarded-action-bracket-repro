"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { saveDraft } from "./actions";

export function Editor({ id }) {
  const text = useRef("");

  // Save on unmount. The cleanup runs after the router has moved to the next
  // route, so the action is POSTed to that route's URL.
  useEffect(
    () => () => {
      saveDraft(id, text.current).then(
        (result) => console.log("saveDraft resolved:", result),
        (error) => console.error("saveDraft rejected:", error.message),
      );
    },
    [id],
  );

  return (
    <>
      <textarea
        aria-label="Draft"
        onChange={(event) => {
          text.current = event.target.value;
        }}
      />
      <p>
        <Link href={`/items/${id}`}>Back to item</Link>
      </p>
    </>
  );
}
