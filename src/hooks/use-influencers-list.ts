"use client";

import { useCallback, useEffect, useState } from "react";

import { listInfluencers } from "@/services/influencers.service";
import { getApiErrorMessage } from "@/types/api-error";
import type {
  InfluencerSortBy,
  InfluencersQueryParams,
  PaginatedInfluencersResponse,
  ProfileStatus,
  SortOrder,
} from "@/types/influencer";

export type InfluencersListFilters = {
  search: string;
  country: string;
  language: string;
  niche: string;
  profileStatus: ProfileStatus | "";
};

export type InfluencersListState = {
  page: number;
  limit: number;
  sortBy: InfluencerSortBy;
  sortOrder: SortOrder;
  filters: InfluencersListFilters;
};

const DEFAULT_FILTERS: InfluencersListFilters = {
  search: "",
  country: "",
  language: "",
  niche: "",
  profileStatus: "",
};

const DEFAULT_STATE: InfluencersListState = {
  page: 1,
  limit: 20,
  sortBy: "createdAt",
  sortOrder: "desc",
  filters: DEFAULT_FILTERS,
};

function buildQueryParams(state: InfluencersListState): InfluencersQueryParams {
  const params: InfluencersQueryParams = {
    page: state.page,
    limit: state.limit,
    sortBy: state.sortBy,
    sortOrder: state.sortOrder,
  };

  if (state.filters.search.trim()) {
    params.search = state.filters.search.trim();
  }

  if (state.filters.country.trim()) {
    params.country = state.filters.country.trim();
  }

  if (state.filters.language.trim()) {
    params.language = state.filters.language.trim();
  }

  if (state.filters.niche.trim()) {
    params.niche = state.filters.niche.trim();
  }

  if (state.filters.profileStatus) {
    params.profileStatus = state.filters.profileStatus;
  }

  return params;
}

type UseInfluencersListOptions = {
  loadErrorMessage: string;
};

export function useInfluencersList({ loadErrorMessage }: UseInfluencersListOptions) {
  const [state, setState] = useState<InfluencersListState>(DEFAULT_STATE);
  const [data, setData] = useState<PaginatedInfluencersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInfluencers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await listInfluencers(buildQueryParams(state));
      setData(response);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, loadErrorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [state, loadErrorMessage]);

  useEffect(() => {
    void fetchInfluencers();
  }, [fetchInfluencers]);

  function setPage(page: number) {
    setState((current) => ({ ...current, page }));
  }

  function setLimit(limit: number) {
    setState((current) => ({ ...current, limit, page: 1 }));
  }

  function setFilters(filters: Partial<InfluencersListFilters>) {
    setState((current) => ({
      ...current,
      page: 1,
      filters: { ...current.filters, ...filters },
    }));
  }

  function toggleSort(sortBy: InfluencerSortBy) {
    setState((current) => {
      if (current.sortBy === sortBy) {
        return {
          ...current,
          sortOrder: current.sortOrder === "asc" ? "desc" : "asc",
        };
      }

      return {
        ...current,
        sortBy,
        sortOrder: "desc",
      };
    });
  }

  function removeInfluencer(id: string) {
    setData((current) => {
      if (!current) {
        return current;
      }

      return {
        data: current.data.filter((influencer) => influencer.id !== id),
        meta: {
          ...current.meta,
          total: Math.max(0, current.meta.total - 1),
        },
      };
    });
  }

  return {
    state,
    data,
    isLoading,
    error,
    setPage,
    setLimit,
    setFilters,
    toggleSort,
    removeInfluencer,
    refetch: fetchInfluencers,
  };
}
