"use client";

import { keepPreviousData, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  getEmailAccountJob,
  getEmailAccountOptions,
  listEmailAccountJobs,
  listEmailAccounts,
} from "@/services/email-accounts.service";
import type {
  EmailAccountJob,
  EmailAccountSortKey,
  EmailAccountStatus,
  EmailAccountsQuery,
} from "@/types/email-accounts";

export const emailAccountKeys = {
  all: ["email-accounts"] as const,
  list: (query: EmailAccountsQuery) => ["email-accounts", "list", query] as const,
  options: ["email-accounts", "options"] as const,
  jobs: ["email-accounts", "jobs"] as const,
  job: (id: string) => ["email-accounts", "job", id] as const,
};

export type EmailAccountFilters = {
  search: string;
  status: EmailAccountStatus | "";
  providers: string[];
  sequenceIds: string[];
  clientIds: string[];
};

const DEFAULT_FILTERS: EmailAccountFilters = {
  search: "",
  status: "",
  providers: [],
  sequenceIds: [],
  clientIds: [],
};

export function useEmailAccountsList() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [sortBy, setSortBy] = useState<EmailAccountSortKey>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filters, setFiltersState] = useState<EmailAccountFilters>(DEFAULT_FILTERS);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(filters.search), 300);
    return () => window.clearTimeout(timeout);
  }, [filters.search]);

  const query: EmailAccountsQuery = useMemo(
    () => ({
      page,
      limit,
      sortBy,
      sortOrder,
      ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.providers.length ? { providers: filters.providers } : {}),
      ...(filters.sequenceIds.length ? { sequenceIds: filters.sequenceIds } : {}),
      ...(filters.clientIds.length ? { clientIds: filters.clientIds } : {}),
    }),
    [page, limit, sortBy, sortOrder, debouncedSearch, filters],
  );

  const result = useQuery({
    queryKey: emailAccountKeys.list(query),
    queryFn: () => listEmailAccounts(query),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const setFilters = useCallback((patch: Partial<EmailAccountFilters>) => {
    setFiltersState((current) => ({ ...current, ...patch }));
    setPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
    setPage(1);
  }, []);

  const setSort = useCallback((key: EmailAccountSortKey, order: "asc" | "desc") => {
    setSortBy(key);
    setSortOrder(order);
    setPage(1);
  }, []);

  const hasActiveFilters =
    Boolean(filters.search.trim()) ||
    Boolean(filters.status) ||
    filters.providers.length > 0 ||
    filters.sequenceIds.length > 0 ||
    filters.clientIds.length > 0;

  return {
    ...result,
    page,
    limit,
    sortBy,
    sortOrder,
    filters,
    hasActiveFilters,
    setPage,
    setLimit: (value: number) => {
      setLimit(value);
      setPage(1);
    },
    setSort,
    setFilters,
    resetFilters,
  };
}

export function useEmailAccountOptions() {
  return useQuery({
    queryKey: emailAccountKeys.options,
    queryFn: getEmailAccountOptions,
    staleTime: 5 * 60_000,
  });
}

const JOB_POLL_MS = 5_000;

/**
 * Recent connect/reconnect jobs (HU-EA-004). Processing jobs are refreshed
 * every 5 s through GET /jobs/:id (which asks Saleshandy); when one completes
 * the accounts table is invalidated.
 */
export function useEmailAccountJobs() {
  const queryClient = useQueryClient();
  const jobsQuery = useQuery({
    queryKey: emailAccountKeys.jobs,
    queryFn: listEmailAccountJobs,
    staleTime: 10_000,
  });

  const processingIds = (jobsQuery.data ?? [])
    .filter((job) => job.status === "PROCESSING")
    .map((job) => job.id);

  const polled = useQueries({
    queries: processingIds.map((id) => ({
      queryKey: emailAccountKeys.job(id),
      queryFn: () => getEmailAccountJob(id),
      refetchInterval: (q: { state: { data?: EmailAccountJob } }) =>
        q.state.data && q.state.data.status !== "PROCESSING" ? false : JOB_POLL_MS,
    })),
  });

  const finishedKey = polled
    .map((q) => (q.data && q.data.status !== "PROCESSING" ? q.data.id : ""))
    .filter(Boolean)
    .join(",");
  const lastFinished = useRef("");

  useEffect(() => {
    if (!finishedKey || finishedKey === lastFinished.current) return;
    lastFinished.current = finishedKey;
    void queryClient.invalidateQueries({ queryKey: emailAccountKeys.jobs });
    void queryClient.invalidateQueries({ queryKey: ["email-accounts", "list"] });
  }, [finishedKey, queryClient]);

  const jobs = (jobsQuery.data ?? []).map((job) => {
    const fresh = polled.find((q) => q.data?.id === job.id)?.data;
    return fresh ? { ...job, ...fresh } : job;
  });

  return { ...jobsQuery, jobs };
}

export function useInvalidateEmailAccounts() {
  const queryClient = useQueryClient();
  return useCallback(
    () => queryClient.invalidateQueries({ queryKey: emailAccountKeys.all }),
    [queryClient],
  );
}
