"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  deleteBrandCandidate,
  listBrandCandidates,
  listBrandDiscoveryRuns,
  searchBrands,
  updateBrandCandidateStatus,
} from "@/services/brand-discovery.service";
import { listInfluencers } from "@/services/influencers.service";
import { getApiErrorMessage } from "@/types/api-error";
import type {
  BrandCandidate,
  BrandDiscoveryRun,
  UpdateBrandCandidateStatusPayload,
} from "@/types/brand-discovery";
import type { BrandCandidateStatusFilterValue } from "@/types/brand-discovery-filter";
import type { Influencer } from "@/types/influencer";

const POLL_INTERVAL_MS = 2500;

export type InfluencerWithBrands = {
  id: string;
  name: string;
  count: number;
};

function filterCandidatesByStatus(
  items: BrandCandidate[],
  statusFilter: BrandCandidateStatusFilterValue,
): BrandCandidate[] {
  if (statusFilter === "ALL") {
    return items;
  }
  return items.filter((item) => item.status === statusFilter);
}

export function useBrandDiscovery() {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewInfluencerIds, setViewInfluencerIds] = useState<Set<string>>(
    new Set(),
  );
  const [statusFilterByInfluencer, setStatusFilterByInfluencer] = useState<
    Record<string, BrandCandidateStatusFilterValue>
  >({});
  const [runs, setRuns] = useState<BrandDiscoveryRun[]>([]);
  const [candidates, setCandidates] = useState<BrandCandidate[]>([]);
  const [loadingInfluencers, setLoadingInfluencers] = useState(true);
  const [searching, setSearching] = useState(false);
  const [limit, setLimit] = useState(20);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const influencersWithBrands = useMemo(() => {
    const map = new Map<string, InfluencerWithBrands>();
    for (const candidate of candidates) {
      const existing = map.get(candidate.influencerId);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(candidate.influencerId, {
          id: candidate.influencerId,
          name: candidate.influencer.name,
          count: 1,
        });
      }
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [candidates]);

  const candidatesByViewedInfluencer = useMemo(() => {
    const map = new Map<
      string,
      { influencerName: string; items: BrandCandidate[] }
    >();

    for (const candidate of candidates) {
      if (!viewInfluencerIds.has(candidate.influencerId)) {
        continue;
      }
      const existing = map.get(candidate.influencerId);
      if (existing) {
        existing.items.push(candidate);
      } else {
        map.set(candidate.influencerId, {
          influencerName: candidate.influencer.name,
          items: [candidate],
        });
      }
    }

    return [...map.entries()].map(([influencerId, group]) => {
      const statusFilter = statusFilterByInfluencer[influencerId] ?? "ALL";
      return [
        influencerId,
        {
          influencerName: group.influencerName,
          items: filterCandidatesByStatus(group.items, statusFilter),
          statusFilter,
          totalCount: group.items.length,
        },
      ] as const;
    });
  }, [candidates, viewInfluencerIds, statusFilterByInfluencer]);

  const loadInfluencers = useCallback(async () => {
    setLoadingInfluencers(true);
    setError(null);
    try {
      const response = await listInfluencers({
        page: 1,
        limit: 100,
        ibpStatus: "ACTIVE",
        sortBy: "name",
        sortOrder: "asc",
      });
      setInfluencers(response.data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoadingInfluencers(false);
    }
  }, []);

  const refreshResults = useCallback(async () => {
    try {
      const [nextRuns, nextCandidates] = await Promise.all([
        listBrandDiscoveryRuns(),
        listBrandCandidates(),
      ]);
      setRuns(nextRuns);
      setCandidates(nextCandidates);

      const validIds = new Set(nextCandidates.map((c) => c.influencerId));
      setViewInfluencerIds((prev) => {
        const next = new Set<string>();
        for (const id of prev) {
          if (validIds.has(id)) {
            next.add(id);
          }
        }
        return next;
      });
      setStatusFilterByInfluencer((prev) => {
        const next: Record<string, BrandCandidateStatusFilterValue> = {};
        for (const [id, value] of Object.entries(prev)) {
          if (validIds.has(id)) {
            next[id] = value;
          }
        }
        return next;
      });
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    void loadInfluencers();
  }, [loadInfluencers]);

  useEffect(() => {
    void refreshResults();
  }, [refreshResults]);

  const hasProcessing = runs.some((run) => run.status === "PROCESSING");
  /** The backend only blocks a new search for talents with a run in progress. */
  const processingInfluencerIds = new Set(
    runs.filter((run) => run.status === "PROCESSING").map((run) => run.influencerId),
  );
  const selectionHasProcessing = [...selectedIds].some((id) => processingInfluencerIds.has(id));

  useEffect(() => {
    if (!hasProcessing) {
      return;
    }

    const timer = window.setInterval(() => {
      void refreshResults();
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [hasProcessing, refreshResults]);

  const toggleInfluencer = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(influencers.map((item) => item.id)));
  }, [influencers]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const toggleViewInfluencer = useCallback((id: string) => {
    setViewInfluencerIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAllView = useCallback(() => {
    setViewInfluencerIds(new Set(influencersWithBrands.map((item) => item.id)));
  }, [influencersWithBrands]);

  const clearViewSelection = useCallback(() => {
    setViewInfluencerIds(new Set());
  }, []);

  const setInfluencerStatusFilter = useCallback(
    (influencerId: string, status: BrandCandidateStatusFilterValue) => {
      setStatusFilterByInfluencer((prev) => ({
        ...prev,
        [influencerId]: status,
      }));
    },
    [],
  );

  const startSearch = useCallback(async () => {
    if (selectedIds.size === 0) {
      return;
    }

    setSearching(true);
    setError(null);
    try {
      await searchBrands([...selectedIds], limit);
      await refreshResults();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSearching(false);
    }
  }, [limit, refreshResults, selectedIds]);

  const [retryingInfluencerId, setRetryingInfluencerId] = useState<string | null>(null);

  /** Re-runs Brand Discovery for one talent (e.g. from a failed run row). */
  const retrySearch = useCallback(
    async (influencerId: string) => {
      setRetryingInfluencerId(influencerId);
      setError(null);
      try {
        await searchBrands([influencerId], limit);
        await refreshResults();
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setRetryingInfluencerId(null);
      }
    },
    [limit, refreshResults],
  );

  const updateStatus = useCallback(
    async (id: string, payload: UpdateBrandCandidateStatusPayload) => {
      setUpdatingId(id);
      setError(null);
      try {
        const updated = await updateBrandCandidateStatus(id, payload);
        setCandidates((prev) =>
          prev.map((item) => (item.id === id ? updated : item)),
        );
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setUpdatingId(null);
      }
    },
    [],
  );

  const deleteCandidate = useCallback(async (id: string) => {
    setDeletingId(id);
    setError(null);
    try {
      await deleteBrandCandidate(id);
      setCandidates((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not delete brand"));
    } finally {
      setDeletingId(null);
    }
  }, []);

  return {
    influencers,
    selectedIds,
    viewInfluencerIds,
    influencersWithBrands,
    candidatesByViewedInfluencer,
    runs,
    loadingInfluencers,
    searching,
    limit,
    setLimit,
    updatingId,
    deletingId,
    error,
    hasProcessing,
    processingInfluencerIds,
    selectionHasProcessing,
    retryingInfluencerId,
    retrySearch,
    toggleInfluencer,
    selectAll,
    clearSelection,
    toggleViewInfluencer,
    selectAllView,
    clearViewSelection,
    setInfluencerStatusFilter,
    startSearch,
    updateStatus,
    deleteCandidate,
    refreshResults,
  };
}
