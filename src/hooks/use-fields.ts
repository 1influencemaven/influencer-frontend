"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  createField,
  listFields,
  setFieldStatus,
  syncFields,
  updateField,
} from "@/services/fields.service";
import type {
  FieldOriginFilter,
  FieldSortKey,
  FieldStatusFilter,
  FieldType,
  FieldsQuery,
  UpdateFieldPayload,
} from "@/types/fields";

export const fieldKeys = {
  all: ["fields"] as const,
  list: (query: FieldsQuery) => ["fields", "list", query] as const,
};

export type FieldFilters = {
  search: string;
  /** Quick tabs: Todos / Personalizados / Sistema / Deshabilitados. */
  tab: FieldOriginFilter | "disabled";
  fieldTypes: FieldType[];
  tags: string[];
};

const DEFAULT_FILTERS: FieldFilters = { search: "", tab: "all", fieldTypes: [], tags: [] };

export function useFieldsList() {
  const [filters, setFiltersState] = useState<FieldFilters>(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState<FieldSortKey>("label");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(filters.search), 300);
    return () => window.clearTimeout(timeout);
  }, [filters.search]);

  const query: FieldsQuery = useMemo(() => {
    const status: FieldStatusFilter = filters.tab === "disabled" ? "disabled" : "active";
    const origin: FieldOriginFilter = filters.tab === "disabled" ? "all" : filters.tab;
    return {
      origin,
      status,
      sortBy,
      sortOrder,
      ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
      ...(filters.fieldTypes.length ? { fieldTypes: filters.fieldTypes } : {}),
      ...(filters.tags.length ? { tags: filters.tags } : {}),
    };
  }, [filters.tab, filters.fieldTypes, filters.tags, debouncedSearch, sortBy, sortOrder]);

  const result = useQuery({
    queryKey: fieldKeys.list(query),
    queryFn: () => listFields(query),
    placeholderData: keepPreviousData,
  });

  const setFilters = useCallback((patch: Partial<FieldFilters>) => {
    setFiltersState((current) => ({ ...current, ...patch }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState((current) => ({ ...DEFAULT_FILTERS, tab: current.tab }));
  }, []);

  const setSort = useCallback((key: FieldSortKey, order: "asc" | "desc") => {
    setSortBy(key);
    setSortOrder(order);
  }, []);

  const hasActiveFilters =
    filters.search.trim() !== "" || filters.fieldTypes.length > 0 || filters.tags.length > 0;

  return { ...result, filters, setFilters, resetFilters, sortBy, sortOrder, setSort, hasActiveFilters };
}

export function useFieldMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: fieldKeys.all });

  const sync = useMutation({ mutationFn: syncFields, onSettled: invalidate });
  const create = useMutation({ mutationFn: createField, onSuccess: invalidate });
  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateFieldPayload }) =>
      updateField(id, payload),
    onSettled: invalidate,
  });
  const setStatus = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      setFieldStatus(id, isActive),
    onSettled: invalidate,
  });

  return { sync, create, update, setStatus };
}
