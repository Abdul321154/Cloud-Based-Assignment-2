"use client";

import { useCallback, useState } from "react";

export function useMarkupBuffer() {
  const [markup, setMarkupState] = useState("");

  const resetMarkup = useCallback(() => {
    setMarkupState("");
  }, []);

  const setMarkup = useCallback((nextMarkup: string) => {
    setMarkupState(nextMarkup);
  }, []);

  return {
    markup,
    setMarkup,
    resetMarkup,
  };
}
