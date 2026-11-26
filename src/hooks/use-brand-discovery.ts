"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { useInfluencersList } from "@/hooks/use-influencers-list";
import {
  deleteBrandCandidate,
  listBrandCandidates,
  listBrandDiscoveryRuns,
  searchBrands,
  updateBrandCandidateStatus,
} from "@/services/brand-discovery.service";
import { getApiErrorMessage } from "@/types/api-error";
import type {
  BrandCandidate,
  UpdateBrandCandidateStatusPayload,
} from "@/types/brand-discovery";
import type { BrandCandidateStatusFilterValue } from "@/types/brand-discovery-filter";

const POLL_INTERVAL_MS = 2500;

export function useBrandDiscovery() {
  const t = useTranslations("BrandDiscovery");
  const influencersList = useInfluencersList({
    loadErrorMessage: t("loadInfluencersError"),
    initialState: {
      sortBy: "name",
      sortOrder: "asc",
      limit: 20,
    },
  });
  const { refetch: refetchInfluencers } = influencersList;

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  /** Remembers IBP status for selected ids across pages. */
  const [ibpStatusById, setIbpStatusById] = useState<
    Record<string, string | null>
  >({});
  const [statusFilterByInfluencer, setStatusFilterByInfluencer] = useState<
    Record<string, BrandCandidateStatusFilterValue>
  >({});
  const [candidates, setCandidates] = useState<BrandCandidate[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasProcessing, setHasProcessing] = useState(false);
  const [limit, setLimit] = useState(20);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const brandCountByInfluencerId = useMemo(() => {
    const map = new Map<string, number>();
    for (const candidate of candidates) {
      map.set(
        candidate.influencerId,
        (map.get(candidate.influencerId) ?? 0) + 1,
      );
    }
    return map;
  }, [candidates]);

  const candidatesBySelectedInfluencer = useMemo(() => {
    const map = new Map<
      string,
      { influencerName: string; items: BrandCandidate[] }
    >();

    for (const candidate of candidates) {
      if (!selectedIds.has(candidate.influencerId)) {
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

    return [...map.entries()]
      .map(([influencerId, group]) => {
        const statusFilter = statusFilterByInfluencer[influencerId] ?? "ALL";
        const items =
          statusFilter === "ALL"
            ? group.items
            : group.items.filter((item) => item.status === statusFilter);
        return [
          influencerId,
          {
            influencerName: group.influencerName,
            items,
            statusFilter,
            totalCount: group.items.length,
          },
        ] as const;
      })
      .sort((a, b) =>
        a[1].influencerName.localeCompare(b[1].influencerName),
      );
  }, [candidates, selectedIds, statusFilterByInfluencer]);

  const refreshCandidates = useCallback(async () => {
    try {
      const [nextRuns, nextCandidates] = await Promise.all([
        listBrandDiscoveryRuns(),
        listBrandCandidates(),
      ]);
      setHasProcessing(nextRuns.some((run) => run.status === "PROCESSING"));
      setCandidates(nextCandidates);

      const validIds = new Set(nextCandidates.map((c) => c.influencerId));
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
      setActionError(getApiErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    void refreshCandidates();
  }, [refreshCandidates]);

  useEffect(() => {
    if (!hasProcessing) {
      return;
    }

    const timer = window.setInterval(() => {
      void refreshCandidates();
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [hasProcessing, refreshCandidates]);

  const pageInfluencers = influencersList.data?.data ?? [];

  useEffect(() => {
    const rows = influencersList.data?.data;
    if (!rows?.length) {
      return;
    }
    setIbpStatusById((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const influencer of rows) {
        const status = influencer.idealBrandProfile?.status ?? null;
        if (next[influencer.id] !== status) {
          next[influencer.id] = status;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [influencersList.data]);

  const selectedWithActiveIbp = useMemo(() => {
    return [...selectedIds].filter((id) => ibpStatusById[id] === "ACTIVE");
  }, [selectedIds, ibpStatusById]);

  /** Search only when every selected influencer has ACTIVE IBP. */
  const allSelectedHaveActiveIbp =
    selectedIds.size > 0 &&
    selectedWithActiveIbp.length === selectedIds.size;

  const canSearchBrands =
    allSelectedHaveActiveIbp && !searching && !hasProcessing;

  const toggleInfluencer = useCallback(
    (id: string, ibpStatus: string | null = null) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
      setIbpStatusById((prev) => ({ ...prev, [id]: ibpStatus }));
    },
    [],
  );

  const selectAllOnPage = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const influencer of pageInfluencers) {
        next.add(influencer.id);
      }
      return next;
    });
    setIbpStatusById((prev) => {
      const next = { ...prev };
      for (const influencer of pageInfluencers) {
        next[influencer.id] = influencer.idealBrandProfile?.status ?? null;
      }
      return next;
    });
  }, [pageInfluencers]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
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
    if (
      selectedIds.size === 0 ||
      selectedWithActiveIbp.length !== selectedIds.size
    ) {
      return;
    }

    setSearching(true);
    setActionError(null);
    try {
      await searchBrands([...selectedIds], limit);
      await refreshCandidates();
      await refetchInfluencers();
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    } finally {
      setSearching(false);
    }
  }, [
    limit,
    refreshCandidates,
    selectedIds,
    selectedWithActiveIbp.length,
    refetchInfluencers,
  ]);

  const updateStatus = useCallback(
    async (id: string, payload: UpdateBrandCandidateStatusPayload) => {
      setUpdatingId(id);
      setActionError(null);
      try {
        const updated = await updateBrandCandidateStatus(id, payload);
        setCandidates((prev) =>
          prev.map((item) => (item.id === id ? updated : item)),
        );
      } catch (err) {
        setActionError(getApiErrorMessage(err));
      } finally {
        setUpdatingId(null);
      }
    },
    [],
  );

  const deleteCandidate = useCallback(async (id: string) => {
    setDeletingId(id);
    setActionError(null);
    try {
      await deleteBrandCandidate(id);
      setCandidates((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setActionError(getApiErrorMessage(err, t("deleteError")));
    } finally {
      setDeletingId(null);
    }
  }, [t]);

  const error = actionError ?? influencersList.error;

  return {
    influencersList,
    selectedIds,
    selectedWithActiveIbp,
    allSelectedHaveActiveIbp,
    canSearchBrands,
    brandCountByInfluencerId,
    candidatesBySelectedInfluencer,
    searching,
    limit,
    setLimit,
    updatingId,
    deletingId,
    error,
    hasProcessing,
    toggleInfluencer,
    selectAllOnPage,
    clearSelection,
    setInfluencerStatusFilter,
    startSearch,
    updateStatus,
    deleteCandidate,
    refreshCandidates,
  };
}
