"use client";

import { useCallback, useEffect, useState } from "react";

import { listAgencyContacts } from "@/services/lead-discovery.service";
import { getApiErrorMessage } from "@/types/api-error";
import type { AgencyContactCommercial } from "@/types/lead-discovery";

const POLL_INTERVAL_MS = 2500;

/**
 * 2C.4.8 — read-only AgencyContact list for the current influencer.
 * Does not enqueue research or mutate Leads.
 */
export function useAgencyContacts(
  influencerId: string | null | undefined,
  options?: { pollWhile?: boolean },
) {
  const pollWhile = options?.pollWhile === true;
  const [contacts, setContacts] = useState<AgencyContactCommercial[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const refreshQuiet = useCallback(async () => {
    if (!influencerId) {
      return;
    }
    const rows = await listAgencyContacts({ influencerId });
    setContacts(rows);
  }, [influencerId]);

  useEffect(() => {
    if (!influencerId) {
      return;
    }
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        await refreshQuiet();
      } catch (err) {
        if (!cancelled) {
          setContacts([]);
          setError(getApiErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [influencerId, reloadToken, refreshQuiet]);

  useEffect(() => {
    if (!influencerId || !pollWhile) {
      return;
    }
    const timer = window.setInterval(() => {
      void refreshQuiet().catch(() => {
        /* keep last good list; hard errors surface on next full refresh */
      });
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [influencerId, pollWhile, refreshQuiet]);

  const refresh = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  return {
    contacts: influencerId ? contacts : [],
    loading: Boolean(influencerId) && loading,
    error: influencerId ? error : null,
    refresh,
    refreshQuiet,
  };
}
