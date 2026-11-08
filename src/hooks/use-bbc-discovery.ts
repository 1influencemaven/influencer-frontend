"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { resolveBbcUiState } from "@/lib/bbc-run-ui-state";
import {
  listBrandBusinessContacts,
  listLeadDiscoveryRuns,
  listLeadProviders,
  searchLeads,
} from "@/services/lead-discovery.service";
import { getApiErrorMessage } from "@/types/api-error";
import {
  BBC_BRIGHTDATA_PROVIDER_ID,
  isBbcWriteProviderId,
  type BrandBusinessContact,
  type LeadDiscoveryRun,
} from "@/types/lead-discovery";

const POLL_INTERVAL_MS = 2500;

/**
 * BBC v1 discovery for one APPROVED brand: providers gate, search enqueue,
 * poll runs + business-contacts. Reuses existing HTTP services only.
 */
export function useBbcDiscovery(brandCandidateId: string | null) {
  const [rebuildMode, setRebuildMode] = useState(false);
  const [providers, setProviders] = useState<string[]>([]);
  const [defaultProvider, setDefaultProvider] = useState<string | null>(null);
  const [contacts, setContacts] = useState<BrandBusinessContact[]>([]);
  const [runs, setRuns] = useState<LeadDiscoveryRun[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pollError, setPollError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const hasProcessing = runs.some((run) => run.status === "PROCESSING");
  const bbcV1Active = rebuildMode;
  const canSearch =
    bbcV1Active &&
    (providers.some((id) => isBbcWriteProviderId(id)) ||
      isBbcWriteProviderId(defaultProvider));

  const refresh = useCallback(async () => {
    if (!brandCandidateId) {
      return;
    }
    const [rows, nextRuns] = await Promise.all([
      listBrandBusinessContacts(brandCandidateId),
      listLeadDiscoveryRuns({ brandCandidateId }),
    ]);
    setContacts(rows);
    setRuns(nextRuns);
  }, [brandCandidateId]);

  useEffect(() => {
    let cancelled = false;
    async function loadMeta() {
      setLoadingMeta(true);
      try {
        const providersResponse = await listLeadProviders();
        if (cancelled) return;
        setProviders(providersResponse.available);
        setDefaultProvider(providersResponse.default);
        setRebuildMode(Boolean(providersResponse.rebuildMode));
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setLoadingMeta(false);
        }
      }
    }
    void loadMeta();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!brandCandidateId) {
      return;
    }
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      setPollError(null);
      try {
        await refresh();
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
  }, [brandCandidateId, reloadToken, refresh]);

  useEffect(() => {
    if (!brandCandidateId || !hasProcessing) {
      return;
    }
    const timer = window.setInterval(() => {
      void refresh()
        .then(() => setPollError(null))
        .catch((err) => setPollError(getApiErrorMessage(err)));
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [brandCandidateId, hasProcessing, refresh]);

  const startSearch = useCallback(async () => {
    if (!brandCandidateId || !canSearch || searching || hasProcessing) {
      return;
    }
    setSearching(true);
    setError(null);
    setPollError(null);
    try {
      const response = await searchLeads({
        brandCandidateIds: [brandCandidateId],
        providerId: BBC_BRIGHTDATA_PROVIDER_ID,
      });
      if (response.runs?.length) {
        setRuns((prev) => {
          const byId = new Map(prev.map((run) => [run.id, run]));
          for (const run of response.runs) {
            byId.set(run.id, run);
          }
          return Array.from(byId.values());
        });
      }
      await refresh();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSearching(false);
    }
  }, [
    brandCandidateId,
    canSearch,
    searching,
    hasProcessing,
    refresh,
  ]);

  const retryLoad = useCallback(() => {
    setLoading(true);
    setError(null);
    setPollError(null);
    setReloadToken((token) => token + 1);
  }, []);

  const uiState = useMemo(
    () =>
      resolveBbcUiState({
        runs,
        contacts,
        loadError: error,
      }),
    [runs, contacts, error],
  );

  return {
    bbcV1Active,
    canSearch,
    contacts,
    runs,
    loading,
    loadingMeta,
    searching,
    hasProcessing,
    error,
    pollError,
    uiState,
    startSearch,
    refresh: retryLoad,
    refreshQuiet: refresh,
  };
}
