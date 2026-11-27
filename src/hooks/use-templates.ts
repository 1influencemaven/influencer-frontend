"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  createTemplate,
  getTemplate,
  getVariablesCatalog,
  listTemplates,
  setTemplateArchived,
  updateTemplate,
} from "@/services/templates.service";
import type { TemplatesQuery, UpdateTemplatePayload } from "@/types/templates";

export const templateKeys = {
  all: ["templates"] as const,
  list: (query: TemplatesQuery) => ["templates", "list", query] as const,
  detail: (id: string) => ["templates", "detail", id] as const,
  variables: (locale: string) => ["templates", "variables", locale] as const,
};

export function useTemplatesList(fixedInfluencerId?: string) {
  const [influencerId, setInfluencerId] = useState(fixedInfluencerId ?? "");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [tab, setTab] = useState<"active" | "archived">("active");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timeout);
  }, [search]);

  const query: TemplatesQuery = useMemo(
    () => ({
      status: tab,
      page,
      limit: 25,
      ...(influencerId ? { influencerId } : {}),
      ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
    }),
    [tab, page, influencerId, debouncedSearch],
  );

  const result = useQuery({ queryKey: templateKeys.list(query), queryFn: () => listTemplates(query), placeholderData: keepPreviousData });

  const changeTab = useCallback((next: "active" | "archived") => {
    setTab(next);
    setPage(1);
  }, []);
  const changeInfluencer = useCallback((next: string) => {
    setInfluencerId(next);
    setPage(1);
  }, []);

  return { ...result, influencerId, setInfluencerId: changeInfluencer, search, setSearch, tab, setTab: changeTab, page, setPage };
}

export function useTemplate(templateId: string | undefined) {
  return useQuery({
    queryKey: templateKeys.detail(templateId ?? ""),
    queryFn: () => getTemplate(templateId as string),
    enabled: Boolean(templateId),
  });
}

export function useVariablesCatalog(locale: string) {
  return useQuery({ queryKey: templateKeys.variables(locale), queryFn: () => getVariablesCatalog(locale), staleTime: 60_000 });
}

export function useTemplateMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: templateKeys.all });
  const create = useMutation({ mutationFn: createTemplate, onSuccess: invalidate });
  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTemplatePayload }) => updateTemplate(id, payload),
    onSuccess: invalidate,
  });
  const archive = useMutation({
    mutationFn: ({ id, archived }: { id: string; archived: boolean }) => setTemplateArchived(id, archived),
    onSuccess: invalidate,
  });
  return { create, update, archive };
}
