"use client";

import { useCallback, useEffect, useState } from "react";

import {
  deselectLeadForOutreach,
  getLeadById,
  listLeadDiscoveryRuns,
  listLeadProviders,
  listLeads,
  searchLeads,
  selectLeadForOutreach,
  updateLeadStatus,
} from "@/services/lead-discovery.service";
import { fetchLeadDetailsForList } from "@/lib/lead-discovery-enrichment";
import { getApiErrorMessage } from "@/types/api-error";
import type {
  LeadDetail,
  LeadDiscoveryRun,
  UpdateLeadStatusPayload,
} from "@/types/lead-discovery";

const POLL_INTERVAL_MS = 2500;
const AUTONOMOUS_PROVIDER = "ai+brightdata";

/**
 * Lead discovery for an approved brand. List rows use {@link LeadDetail} (enriched
 * via GET /leads/:id) — temporary D3.1 until the list endpoint includes channels.
 */
export function useLeadDiscovery(brandCandidateId: string | null) {
  const [providers, setProviders] = useState<string[]>([]);
  const [defaultProvider, setDefaultProvider] = useState<string | null>(null);
  const [limit, setLimit] = useState(10);
  const [leads, setLeads] = useState<LeadDetail[]>([]);
  const [runs, setRuns] = useState<LeadDiscoveryRun[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [loadingLeads, setLoadingLeads] = useState(false);
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
    const [listRows, nextRuns] = await Promise.all([
      listLeads({ brandCandidateId }),
      listLeadDiscoveryRuns({ brandCandidateId }),
    ]);
    const details = await fetchLeadDetailsForList(listRows.map((row) => row.id));
    setLeads(details);
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
      return;
    }
    let cancelled = false;
    async function load() {
      setLoadingLeads(true);
      setError(null);
      try {
        await refreshLeadsAndRuns();
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setLoadingLeads(false);
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

  const replaceLeadDetail = useCallback((detail: LeadDetail) => {
    setLeads((prev) =>
      prev.map((lead) => (lead.id === detail.id ? detail : lead)),
    );
  }, []);

  const updateStatus = useCallback(
    async (id: string, payload: UpdateLeadStatusPayload) => {
      setUpdatingId(id);
      setError(null);
      try {
        await updateLeadStatus(id, payload);
        const detail = await getLeadById(id);
        replaceLeadDetail(detail);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setUpdatingId(null);
      }
    },
    [replaceLeadDetail],
  );

  const selectForOutreach = useCallback(async (id: string) => {
    setUpdatingId(id);
    setError(null);
    try {
      await selectLeadForOutreach(id);
      await refreshLeadsAndRuns();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  }, [refreshLeadsAndRuns]);

  const deselectForOutreach = useCallback(async (id: string) => {
    setUpdatingId(id);
    setError(null);
    try {
      await deselectLeadForOutreach(id);
      const detail = await getLeadById(id);
      replaceLeadDetail(detail);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  }, [replaceLeadDetail]);

  return {
    providers,
    defaultProvider,
    limit,
    setLimit,
    leads: brandCandidateId ? leads : [],
    runs: brandCandidateId ? runs : [],
    loadingMeta,
    loadingLeads,
    searching,
    updatingId,
    error,
    hasProcessing,
    canSearch,
    startSearch,
    updateStatus,
    selectForOutreach,
    deselectForOutreach,
  };
}
