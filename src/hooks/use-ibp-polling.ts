"use client";

import { useCallback, useEffect, useRef } from "react";

import { getIdealBrandProfile } from "@/services/ideal-brand-profiles.service";
import { isApiError } from "@/types/api-error";
import type { IdealBrandProfile } from "@/types/ideal-brand-profile";

type UseIbpPollingOptions = {
  influencerId: string;
  enabled: boolean;
  onUpdate: (profile: IdealBrandProfile) => void;
  intervalMs?: number;
};

export function useIbpPolling({
  influencerId,
  enabled,
  onUpdate,
  intervalMs = 3000,
}: UseIbpPollingOptions) {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  const poll = useCallback(async () => {
    try {
      const profile = await getIdealBrandProfile(influencerId);
      onUpdateRef.current(profile);
    } catch (error) {
      if (!isApiError(error) || error.status !== 404) {
        return;
      }
    }
  }, [influencerId]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    void poll();
    const intervalId = window.setInterval(() => void poll(), intervalMs);
    return () => window.clearInterval(intervalId);
  }, [enabled, intervalMs, poll]);
}
