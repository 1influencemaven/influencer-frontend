"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  approveContacts,
  getApprovedIds,
  importProspectsCsv,
  listProspects,
  unapproveContacts,
  updateProspect,
} from "@/services/prospects.service";
import type {
  ApprovalItem,
  ProspectContactKind,
  ProspectSource,
  ProspectsQuery,
  UpdateProspectPayload,
} from "@/types/prospects";

export const prospectKeys = {
  all: ["prospects"] as const,
  list: (query: ProspectsQuery) => ["prospects", "list", query] as const,
  approved: (influencerId: string) => ["prospects", "approved", influencerId] as const,
};

export type ProspectFilters = {
  influencerId: string;
  search: string;
  /** Quick tabs: Todos / Personas / Buzones / Archivados. */
  tab: "all" | "PERSON" | "MAILBOX" | "archived";
  source: ProspectSource | "";
};

const DEFAULT_FILTERS: ProspectFilters = { influencerId: "", search: "", tab: "all", source: "" };

export function useProspectsList(initialInfluencerId = "") {
  const [filters, setFiltersState] = useState<ProspectFilters>({ ...DEFAULT_FILTERS, influencerId: initialInfluencerId });
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<ProspectsQuery["sortBy"]>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(filters.search), 300);
    return () => window.clearTimeout(timeout);
  }, [filters.search]);

  const query: ProspectsQuery = useMemo(
    () => ({
      status: filters.tab === "archived" ? "archived" : "active",
      sortBy,
      sortOrder,
      page,
      limit: 25,
      ...(filters.influencerId ? { influencerId: filters.influencerId } : {}),
      ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
      ...(filters.source ? { source: filters.source } : {}),
      ...(filters.tab === "PERSON" || filters.tab === "MAILBOX"
        ? { contactKind: filters.tab as ProspectContactKind }
        : {}),
    }),
    [filters.tab, filters.influencerId, filters.source, debouncedSearch, sortBy, sortOrder, page],
  );

  const result = useQuery({
    queryKey: prospectKeys.list(query),
    queryFn: () => listProspects(query),
    placeholderData: keepPreviousData,
  });

  const setFilters = useCallback((patch: Partial<ProspectFilters>) => {
    setFiltersState((current) => ({ ...current, ...patch }));
    setPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState((current) => ({ ...DEFAULT_FILTERS, influencerId: current.influencerId, tab: current.tab }));
    setPage(1);
  }, []);

  const setSort = useCallback((key: ProspectsQuery["sortBy"], order: "asc" | "desc") => {
    setSortBy(key);
    setSortOrder(order);
  }, []);

  const hasActiveFilters = filters.search.trim() !== "" || filters.source !== "";

  return { ...result, filters, setFilters, resetFilters, page, setPage, sortBy, sortOrder, setSort, hasActiveFilters };
}

/** Which discovered contacts are already prospects for a talent (drives "Approved" buttons). */
export function useApprovedProspectIds(influencerId: string | null | undefined) {
  return useQuery({
    queryKey: prospectKeys.approved(influencerId ?? ""),
    queryFn: () => getApprovedIds(influencerId as string),
    enabled: Boolean(influencerId),
    staleTime: 30_000,
  });
}

export function useProspectMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: prospectKeys.all });

  const approve = useMutation({ mutationFn: (items: ApprovalItem[]) => approveContacts(items), onSettled: invalidate });
  const unapprove = useMutation({ mutationFn: (items: ApprovalItem[]) => unapproveContacts(items), onSettled: invalidate });
  const importCsv = useMutation({ mutationFn: importProspectsCsv, onSettled: invalidate });
  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProspectPayload }) => updateProspect(id, payload),
    onSettled: invalidate,
  });
  return { approve, unapprove, importCsv, update };
}
