"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

import { influencerKeys } from "@/lib/influencer-query-keys";
import { listInfluencers } from "@/services/influencers.service";
import { getApiErrorMessage } from "@/types/api-error";
import type {
  InfluencerSortBy,
  InfluencersQueryParams,
  SortOrder,
} from "@/types/influencer";

export type InfluencersListFilters = {
  search: string;
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
};

const DEFAULT_STATE: InfluencersListState = {
  page: 1,
  limit: 20,
  sortBy: "createdAt",
  sortOrder: "desc",
  filters: DEFAULT_FILTERS,
};

export function buildInfluencersQueryParams(
  state: InfluencersListState,
): InfluencersQueryParams {
  const params: InfluencersQueryParams = {
    page: state.page,
    limit: state.limit,
    sortBy: state.sortBy,
    sortOrder: state.sortOrder,
  };

  if (state.filters.search.trim()) {
    params.search = state.filters.search.trim();
  }

  return params;
}

type UseInfluencersListOptions = {
  loadErrorMessage: string;
};

export function useInfluencersList({ loadErrorMessage }: UseInfluencersListOptions) {
  const [state, setState] = useState<InfluencersListState>(DEFAULT_STATE);
  const queryClient = useQueryClient();
  const queryParams = useMemo(() => buildInfluencersQueryParams(state), [state]);

  const query = useQuery({
    queryKey: influencerKeys.list(queryParams),
    queryFn: () => listInfluencers(queryParams),
  });

  const error = query.error
    ? getApiErrorMessage(query.error, loadErrorMessage)
    : null;

  const setPage = useCallback((page: number) => {
    setState((current) => ({ ...current, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setState((current) => ({ ...current, limit, page: 1 }));
  }, []);

  const setFilters = useCallback((filters: Partial<InfluencersListFilters>) => {
    setState((current) => ({
      ...current,
      page: 1,
      filters: { ...current.filters, ...filters },
    }));
  }, []);

  const toggleSort = useCallback((sortBy: InfluencerSortBy) => {
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
  }, []);

  const removeInfluencer = useCallback(
    (id: string) => {
      queryClient.setQueryData(
        influencerKeys.list(queryParams),
        (current: Awaited<ReturnType<typeof listInfluencers>> | undefined) => {
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
        },
      );
    },
    [queryClient, queryParams],
  );

  return {
    state,
    data: query.data ?? null,
    isLoading: query.isLoading || query.isFetching,
    error,
    setPage,
    setLimit,
    setFilters,
    toggleSort,
    removeInfluencer,
    refetch: () => query.refetch(),
  };
}
