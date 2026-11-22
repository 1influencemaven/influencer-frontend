"use client";

import { useCallback, useEffect, useRef } from "react";

import { getInstagramResearchRun } from "@/services/influencers.service";
import type { InstagramResearchRun } from "@/types/influencer";

type UseInstagramResearchPollingOptions = {
  runId: string | null;
  enabled: boolean;
  onUpdate: (run: InstagramResearchRun) => void;
  intervalMs?: number;
};

/**
 * Polls Instagram research run status while PROCESSING (Brand Discovery / IBP style).
 */
export function useInstagramResearchPolling({
  runId,
  enabled,
  onUpdate,
  intervalMs = 2500,
}: UseInstagramResearchPollingOptions) {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  const poll = useCallback(async () => {
    if (!runId) {
      return;
    }
    try {
      const run = await getInstagramResearchRun(runId);
      onUpdateRef.current(run);
    } catch {
      // Keep polling; transient network errors should not clear the run.
    }
  }, [runId]);

  useEffect(() => {
    if (!enabled || !runId) {
      return;
    }

    void poll();
    const intervalId = window.setInterval(() => void poll(), intervalMs);
    return () => window.clearInterval(intervalId);
  }, [enabled, intervalMs, poll, runId]);
}
