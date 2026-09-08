"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type CopyStatus = "idle" | "success" | "error";

const SUCCESS_RESET_MS = 2000;

export function useCopyToClipboard() {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearResetTimer = useCallback(() => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  }, []);

  useEffect(() => clearResetTimer, [clearResetTimer]);

  const copy = useCallback(
    async (text: string) => {
      clearResetTimer();

      try {
        await navigator.clipboard.writeText(text);
        setStatus("success");
        resetTimerRef.current = setTimeout(() => {
          setStatus("idle");
        }, SUCCESS_RESET_MS);
      } catch {
        setStatus("error");
      }
    },
    [clearResetTimer],
  );

  return { copy, status };
}
