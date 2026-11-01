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
import {
  BBC_BRIGHTDATA_PROVIDER_ID,
  type LeadDetail,
  type LeadDiscoveryRun,
  type UpdateLeadStatusPayload,
} from "@/types/lead-discovery";

const POLL_INTERVAL_MS = 2500;
const AUTONOMOUS_PROVIDER = "ai+brightdata";

/**
 * Person-lead discovery for an approved brand (legacy path).
 * When `rebuildMode` (BBC v1), person search is disabled here — commercial
 * discovery lives in {@link useBbcDiscovery} / BrandBusinessContactsPanel.
 * List rows use {@link LeadDetail} (enriched via GET /leads/:id).
 */
export function useLeadDiscovery(brandCandidateId: string | null) {
  const [providers, setProviders] = useState<string[]>([]);
  const [defaultProvider, setDefaultProvider] = useState<string | null>(null);
  const [rebuildMode, setRebuildMode] = useState(false);
  const [limit, setLimit] = useState(10);
  const [leads, setLeads] = useState<LeadDetail[]>([]);
  const [runs, setRuns] = useState<LeadDiscoveryRun[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [searching, setSearching] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasProcessing = runs.some((run) => run.status === "PROCESSING");
  /** Legacy person search only when rebuild/BBC write path is off. */
  const canSearch =
    !rebuildMode &&
    (providers.includes(AUTONOMOUS_PROVIDER) ||
      providers.includes(defaultProvider ?? "") ||
      (providers.length > 0 &&
        !providers.every((id) => id === BBC_BRIGHTDATA_PROVIDER_ID)));
  const bbcV1Active = rebuildMode;

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
      const response = await searchLeads({
        brandCandidateIds: [brandCandidateId],
        ...(providerId ? { providerId } : {}),
        limit,
      });
      // Seed PROCESSING runs immediately so polling starts before list refresh.
      if (response.runs?.length) {
        setRuns((prev) => {
          const byId = new Map(prev.map((run) => [run.id, run]));
          for (const run of response.runs) {
            byId.set(run.id, run);
          }
          return Array.from(byId.values());
        });
      }
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
    rebuildMode,
    bbcV1Active,
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
    refreshLeadsAndRuns,
    updateStatus,
    selectForOutreach,
    deselectForOutreach,
  };
}
