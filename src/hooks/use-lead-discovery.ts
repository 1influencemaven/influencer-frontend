"use client";

import { useCallback, useEffect, useState } from "react";

import {
  listLeadDiscoveryRuns,
  listLeadProviders,
  listLeads,
  searchLeads,
  updateLeadStatus,
} from "@/services/lead-discovery.service";
import { getApiErrorMessage } from "@/types/api-error";
import type {
  Lead,
  LeadDiscoveryRun,
  UpdateLeadStatusPayload,
} from "@/types/lead-discovery";

const POLL_INTERVAL_MS = 2500;
const AUTONOMOUS_PROVIDER = "ai+brightdata";

export function useLeadDiscovery(brandCandidateId: string | null) {
  const [providers, setProviders] = useState<string[]>([]);
  const [defaultProvider, setDefaultProvider] = useState<string | null>(null);
  const [limit, setLimit] = useState(10);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [runs, setRuns] = useState<LeadDiscoveryRun[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [searching, setSearching] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasProcessing = runs.some((run) => run.status === "PROCESSING");
  const canSearch =
    providers.includes(AUTONOMOUS_PROVIDER) ||
    providers.includes(defaultProvider ?? "") ||
    providers.length > 0;

  const refreshLeadsAndRuns = useCallback(async () => {
    if (!brandCandidateId) {
      return;
    }
    const [nextLeads, nextRuns] = await Promise.all([
      listLeads({ brandCandidateId }),
      listLeadDiscoveryRuns({ brandCandidateId }),
    ]);
    setLeads(nextLeads);
    setRuns(nextRuns);
  }, [brandCandidateId]);

  useEffect(() => {
    let cancelled = false;
    async function loadMeta() {
      setLoadingMeta(true);
      setError(null);
      try {
        const providersResponse = await listLeadProviders();
        if (cancelled) return;
        setProviders(providersResponse.available);
        setDefaultProvider(providersResponse.default);
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
      setLeads([]);
      setRuns([]);
      return;
    }
    let cancelled = false;
    async function load() {
      try {
        await refreshLeadsAndRuns();
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err));
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [brandCandidateId, refreshLeadsAndRuns]);

  useEffect(() => {
    if (!brandCandidateId || !hasProcessing) {
      return;
    }
    const timer = setInterval(() => {
      void refreshLeadsAndRuns().catch(() => undefined);
    }, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [brandCandidateId, hasProcessing, refreshLeadsAndRuns]);

  const startSearch = useCallback(async () => {
    if (!brandCandidateId || !canSearch) {
      return;
    }
    setSearching(true);
    setError(null);
    try {
      const providerId =
        defaultProvider ??
        (providers.includes(AUTONOMOUS_PROVIDER)
          ? AUTONOMOUS_PROVIDER
          : providers[0]);
      await searchLeads({
        brandCandidateIds: [brandCandidateId],
        ...(providerId ? { providerId } : {}),
        limit,
      });
      await refreshLeadsAndRuns();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSearching(false);
    }
  }, [
    brandCandidateId,
    canSearch,
    defaultProvider,
    providers,
    limit,
    refreshLeadsAndRuns,
  ]);

  const updateStatus = useCallback(
    async (id: string, payload: UpdateLeadStatusPayload) => {
      setUpdatingId(id);
      setError(null);
      try {
        const updated = await updateLeadStatus(id, payload);
        setLeads((prev) =>
          prev.map((lead) => (lead.id === id ? updated : lead)),
        );
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setUpdatingId(null);
      }
    },
    [],
  );

  return {
    providers,
    defaultProvider,
    limit,
    setLimit,
    leads,
    runs,
    loadingMeta,
    searching,
    updatingId,
    error,
    hasProcessing,
    canSearch,
    startSearch,
    updateStatus,
  };
}
